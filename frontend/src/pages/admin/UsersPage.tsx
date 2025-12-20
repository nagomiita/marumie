import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import DataTable, { type Column } from "@/components/common/DataTable";
import {
  useListUsersUsersGet,
  useUpdateUserRoleUsersUserIdRolePatch,
  useDeleteUserUsersUserIdDelete,
} from "@/client/api/generated/users/users";
import type { UserRead } from "@/client/api/generated/model";
import { EnumUserRole } from "@/client/api/generated/model";

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "user" as EnumUserRole,
  });

  // ユーザー一覧取得
  const { data: usersResponse, isLoading } = useListUsersUsersGet();
  const users = usersResponse?.data ?? [];

  // ロール更新
  const updateRoleMutation = useUpdateUserRoleUsersUserIdRolePatch();

  // ユーザー削除
  const deleteUserMutation = useDeleteUserUsersUserIdDelete();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: バックエンドにユーザー作成APIを追加する必要があります
    alert("ユーザー作成機能は未実装です");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("本当に削除しますか?")) return;

    try {
      await deleteUserMutation.mutateAsync({ userId: id });
      queryClient.invalidateQueries({ queryKey: ["listUsersUsersGet"] });
      alert("ユーザーを削除しました");
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("ユーザーの削除に失敗しました");
    }
  };

  const handleRoleChange = async (id: string, newRole: string) => {
    try {
      await updateRoleMutation.mutateAsync({
        userId: id,
        params: { role: newRole as EnumUserRole },
      });
      queryClient.invalidateQueries({ queryKey: ["listUsersUsersGet"] });
    } catch (error) {
      console.error("Error updating role:", error);
      alert("ロールの変更に失敗しました");
    }
  };

  if (isLoading) {
    return <div>読込中...</div>;
  }

  const columns: Column<UserRead>[] = [
    {
      key: "email",
      label: "メールアドレス",
      sortable: true,
      render: (user) => (
        <span className="font-medium text-gray-900">{user.email}</span>
      ),
    },
    {
      key: "role",
      label: "ロール",
      filterable: true,
      filterType: "select",
      filterOptions: [EnumUserRole.user, EnumUserRole.admin],
      render: (user) => (
        <select
          value={user.role}
          onChange={(e) => handleRoleChange(user.id, e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value={EnumUserRole.user}>ユーザー</option>
          <option value={EnumUserRole.admin}>管理者</option>
        </select>
      ),
    },
    {
      key: "created_at",
      label: "作成日",
      sortable: true,
      render: (user) => new Date(user.created_at).toLocaleDateString("ja-JP"),
    },
    {
      key: "actions",
      label: "操作",
      render: (user) => (
        <button
          type="button"
          onClick={() => handleDelete(user.id)}
          className="text-red-600 hover:text-red-900"
        >
          削除
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">ユーザー管理</h1>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {showForm ? "キャンセル" : "新規作成"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            ユーザーを作成
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="user-email"
                className="block text-sm font-medium text-gray-700"
              >
                メールアドレス
              </label>
              <input
                id="user-email"
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="user-password"
                className="block text-sm font-medium text-gray-700"
              >
                パスワード
              </label>
              <input
                id="user-password"
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                6文字以上で入力してください
              </p>
            </div>
            <div>
              <label
                htmlFor="user-role"
                className="block text-sm font-medium text-gray-700"
              >
                ロール
              </label>
              <select
                id="user-role"
                value={formData.role}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    role: e.target.value as EnumUserRole,
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value={EnumUserRole.user}>ユーザー</option>
                <option value={EnumUserRole.admin}>管理者</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              作成
            </button>
          </form>
        </div>
      )}

      <DataTable
        data={users}
        columns={columns}
        keyExtractor={(user) => user.id}
      />
    </div>
  );
}
