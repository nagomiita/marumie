import "server-only";

import Link from "next/link";
import { loadOrganizationsData } from "@/server/loaders/load-organizations-data";

export default async function OrganizationsPage() {
  const organizations = await loadOrganizationsData();

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "household":
        return "家計簿";
      case "business":
        return "事業";
      case "nonprofit":
        return "非営利団体";
      default:
        return "その他";
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="bg-primary-panel rounded-xl p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">組織管理</h1>
        <Link
          href="/organizations/new"
          className="bg-primary-accent text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          新しい組織を作成
        </Link>
      </div>

      {organizations.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400 mb-4">組織が登録されていません</p>
          <Link
            href="/organizations/new"
            className="bg-primary-accent text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors inline-block"
          >
            最初の組織を作成
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-primary-border">
                <th className="px-4 py-3 text-left text-sm font-semibold text-white">
                  組織名
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white">
                  表示名
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white">
                  タイプ
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white">
                  スラッグ
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white">
                  作成日時
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white">
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {organizations.map((org) => (
                <tr key={org.id} className="border-b border-primary-border">
                  <td className="px-4 py-3 text-white">{org.name}</td>
                  <td className="px-4 py-3 text-white">{org.displayName}</td>
                  <td className="px-4 py-3 text-gray-300">
                    {getTypeLabel(org.type)}
                  </td>
                  <td className="px-4 py-3 text-gray-300 font-mono">
                    {org.slug}
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    {formatDate(org.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/organizations/${org.id}`}
                      className="text-primary-accent hover:text-blue-300 text-sm"
                    >
                      編集
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
