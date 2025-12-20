import { useAuth } from "@/contexts/AuthContext";

export default function AdminDashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">ダッシュボード</h1>
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-700">ようこそ、{user?.email}さん</p>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <a
            href="/admin/organizations"
            className="block p-6 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
          >
            <h3 className="text-lg font-medium text-blue-900">組織管理</h3>
            <p className="mt-2 text-sm text-blue-700">組織の作成・編集・削除</p>
          </a>
          <a
            href="/admin/transactions"
            className="block p-6 bg-green-50 rounded-lg hover:bg-green-100 transition"
          >
            <h3 className="text-lg font-medium text-green-900">
              トランザクション
            </h3>
            <p className="mt-2 text-sm text-green-700">取引データの管理</p>
          </a>
          <a
            href="/admin/csv-upload"
            className="block p-6 bg-purple-50 rounded-lg hover:bg-purple-100 transition"
          >
            <h3 className="text-lg font-medium text-purple-900">
              CSVアップロード
            </h3>
            <p className="mt-2 text-sm text-purple-700">データのインポート</p>
          </a>
          <a
            href="/admin/categories"
            className="block p-6 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition"
          >
            <h3 className="text-lg font-medium text-indigo-900">
              カテゴリ管理
            </h3>
            <p className="mt-2 text-sm text-indigo-700">カテゴリの作成・編集</p>
          </a>
          <a
            href="/admin/users"
            className="block p-6 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition"
          >
            <h3 className="text-lg font-medium text-yellow-900">
              ユーザー管理
            </h3>
            <p className="mt-2 text-sm text-yellow-700">ユーザーの作成・編集</p>
          </a>
        </div>
      </div>
    </div>
  );
}
