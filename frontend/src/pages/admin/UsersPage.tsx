import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import DataTable, { type Column } from "@/components/common/DataTable";
import Modal from "@/components/common/Modal";
import Form, { type FormField } from "@/components/common/Form";
import {
  useListUsersUsersGet,
  useUpdateUserRoleUsersUserIdRolePatch,
  useDeleteUserUsersUserIdDelete,
} from "@/client/api/generated/users/users";
import type { UserRead } from "@/client/api/generated/model";
import { EnumUserRole } from "@/client/api/generated/model";

interface UserCreateForm {
  email: string;
  password: string;
  role: EnumUserRole;
}

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<UserCreateForm>({
    email: "",
    password: "",
    role: EnumUserRole.user,
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
    setShowForm(false);
  };

  const handleCancel = () => {
    setShowForm(false);
    setFormData({
      email: "",
      password: "",
      role: EnumUserRole.user,
    });
  };

  const formFields: FormField<UserCreateForm>[] = [
    {
      name: "email",
      label: "メールアドレス",
      type: "email",
      required: true,
    },
    {
      name: "password",
      label: "パスワード",
      type: "password",
      required: true,
      minLength: 6,
      title: "6文字以上で入力してください",
    },
    {
      name: "role",
      label: "ロール",
      type: "select",
      required: true,
      options: [
        { value: EnumUserRole.user, label: "ユーザー" },
        { value: EnumUserRole.admin, label: "管理者" },
      ],
    },
  ];

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
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          新規作成
        </button>
      </div>

      <Modal open={showForm} onClose={handleCancel}>
        <h2 className="text-lg font-semibold mb-4">新規ユーザー</h2>
        <Form
          fields={formFields}
          formData={formData}
          onChange={setFormData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitLabel="作成"
        />
      </Modal>

      <DataTable
        data={users}
        columns={columns}
        keyExtractor={(user) => user.id}
      />
    </div>
  );
}
