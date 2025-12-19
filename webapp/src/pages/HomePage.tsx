import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { listPoliticalOrganizationsPoliticalOrganizationsGet } from "@/client/api/generated/political-organizations/political-organizations";
import type { PoliticalOrganizationRead } from "@/client/api/generated/model";
import Layout from "@/components/Layout";

export default function HomePage() {
  const [organizations, setOrganizations] = useState<
    PoliticalOrganizationRead[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    listPoliticalOrganizationsPoliticalOrganizationsGet()
      .then((response) => {
        setOrganizations(response.data);
        if (response.data[0]) {
          navigate(`/o/${response.data[0].slug}`, { replace: true });
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [navigate]);

  const content = (() => {
    if (loading) return <p className="text-gray-700">読込中...</p>;
    if (error)
      return <p className="text-red-600">データ取得に失敗しました: {error}</p>;
    if (!organizations.length)
      return <p className="text-gray-700">データが存在しません</p>;

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">組織一覧</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {organizations.map((org) => (
            <Link
              key={org.id}
              to={`/o/${org.slug}`}
              className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition"
            >
              <p className="text-sm text-gray-500">
                {org.org_name || "政治団体"}
              </p>
              <p className="text-xl font-bold text-gray-900">
                {org.display_name}
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
