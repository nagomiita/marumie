import { useState } from "react";
import {
  useListOrganizations,
  useCreateOrganization,
  useDeleteOrganization,
} from "@/client/api/generated/organizations/organizations";
import { EnumOrganizationType } from "@/client/api/generated/model";
import type { OrganizationRead } from "@/client/api/generated/model";
import DataTable, { type Column } from "@/components/common/DataTable";

export default function OrganizationsPage() {
  const {
    data: organizations,
    isLoading: loading,
    refetch,
  } = useListOrganizations();
  const createMutation = useCreateOrganization();
  const deleteMutation = useDeleteOrganization();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    display_name: string;
    type: EnumOrganizationType;
    slug: string;
    description: string;
  }>({
    name: "",
    display_name: "",
    type: EnumOrganizationType.household,
    slug: "",
    description: "",
  });

  const organizationList = Array.isArray(organizations?.data)
    ? organizations.data
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({
        data: formData,
      });

      setShowForm(false);
      setFormData({
        name: "",
        display_name: "",
        type: EnumOrganizationType.household,
        slug: "",
        description: "",
      });
      refetch();
    } catch (error) {
      console.error("Error creating organization:", error);
      alert("組織の作成に失敗しました");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("本当に削除しますか？")) return;

    try {
      await deleteMutation.mutateAsync({
        organizationId: id,
      });
      refetch();
    } catch (error) {
      console.error("Error deleting organization:", error);
      alert("組織の削除に失敗しました");
    }
  };

  const typeLabels: Record<string, string> = {
    household: "家計簿",
    business: "ビジネス",
    nonprofit: "非営利",
    political_organization: "政治団体",
    other: "その他",
  };

  const columns: Column<OrganizationRead>[] = [
    {
      key: "display_name",
      label: "表示名",
      sortable: true,
      filterable: true,
      filterType: "text",
      className: "font-medium",
    },
    {
      key: "slug",
      label: "スラッグ",
      sortable: true,
    },
    {
      key: "type",
      label: "タイプ",
      sortable: true,
      filterable: true,
      filterType: "select",
      filterOptions: Object.values(typeLabels),
      render: (org) => typeLabels[org.type] || org.type,
    },
    {
      key: "created_at",
      label: "作成日",
      sortable: true,
      render: (org) => new Date(org.created_at).toLocaleDateString("ja-JP"),
    },
    {
      key: "actions",
      label: "操作",
      className: "text-right",
      render: (org) => (
        <button
          type="button"
          onClick={() => handleDelete(org.id)}
          className="text-red-600 hover:text-red-900"
        >
          削除
        </button>
      ),
    },
  ];

  if (loading) {
    return <div>読込中...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">組織管理</h1>
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
          <h2 className="text-lg font-medium text-gray-900 mb-4">組織を作成</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="org-name"
                className="block text-sm font-medium text-gray-700"
              >
                名前（内部ID）
              </label>
              <input
                id="org-name"
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="org-display-name"
                className="block text-sm font-medium text-gray-700"
              >
                表示名
              </label>
              <input
                id="org-display-name"
                type="text"
                required
                value={formData.display_name}
                onChange={(e) =>
                  setFormData({ ...formData, display_name: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="org-slug"
                className="block text-sm font-medium text-gray-700"
              >
                スラッグ
              </label>
              <input
                id="org-slug"
                type="text"
                required
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="org-type"
                className="block text-sm font-medium text-gray-700"
              >
                タイプ
              </label>
              <select
                id="org-type"
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target
                      .value as (typeof EnumOrganizationType)[keyof typeof EnumOrganizationType],
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value={EnumOrganizationType.household}>家計簿</option>
                <option value={EnumOrganizationType.business}>ビジネス</option>
                <option value={EnumOrganizationType.nonprofit}>非営利</option>
                <option value={EnumOrganizationType.political_organization}>
                  政治団体
                </option>
                <option value={EnumOrganizationType.other}>その他</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="org-description"
                className="block text-sm font-medium text-gray-700"
              >
                説明
              </label>
              <textarea
                id="org-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
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
        data={organizationList}
        columns={columns}
        keyExtractor={(org) => org.id}
        pageSize={20}
      />
    </div>
  );
}
