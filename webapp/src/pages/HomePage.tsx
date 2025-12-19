import { Link } from "react-router-dom";
import { useListOrganizations } from "@/client/api/generated/organizations/organizations";
import Layout from "@/components/Layout";

export default function HomePage() {
  const { data, isLoading, error } = useListOrganizations();

  const organizations = Array.isArray(data?.data) ? data.data : [];

  const content = (() => {
    if (isLoading) return <p className="text-gray-700">読込中...</p>;
    if (error)
      return (
        <p className="text-red-600">
          データ取得に失敗しました: {String(error)}
        </p>
      );
    if (!organizations.length)
      return <p className="text-gray-700">データが存在しません</p>;

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">組織一覧</h2>
          <Link
            to="/admin/login"
            className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition"
          >
            管理画面
          </Link>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {organizations.map((org) => (
            <Link
              key={org.id}
              to={`/o/${org.slug}`}
              className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition"
            >
              <p className="text-sm text-gray-500">
                {org.type === "political_organization"
                  ? "政治団体"
                  : org.type === "household"
                    ? "家計簿"
                    : org.type === "nonprofit"
                      ? "非営利団体"
                      : "組織"}
              </p>
              <p className="text-xl font-bold text-gray-900">
                {org.display_name || org.name}
              </p>
              {org.description && (
                <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                  {org.description}
                </p>
              )}
            </Link>
          ))}
        </div>
      </div>
    );
  })();

  return <Layout>{content}</Layout>;
}
