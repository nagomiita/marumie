import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  getListOrganizationsQueryKey,
  useListOrganizations,
  useCreateOrganization,
  useDeleteOrganization,
} from "@/client/api/generated/organizations/organizations";
import { EnumOrganizationType } from "@/client/api/generated/model";
import type { OrganizationRead } from "@/client/api/generated/model";
import DataTable, { type Column } from "@/components/common/DataTable";
import Modal from "@/components/common/Modal";
import Form, { type FormField } from "@/components/common/Form";
import Button from "@/components/common/Button";

interface OrganizationCreateForm {
  name: string;
  display_name: string;
  type: EnumOrganizationType;
  slug: string;
  description: string;
}

export default function OrganizationsPage() {
  const queryClient = useQueryClient();
  const { data: organizations, isLoading: loading } = useListOrganizations();
  const createMutation = useCreateOrganization();
  const deleteMutation = useDeleteOrganization();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<OrganizationCreateForm>({
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
      await queryClient.invalidateQueries({
        queryKey: getListOrganizationsQueryKey(),
      });
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
      await queryClient.invalidateQueries({
        queryKey: getListOrganizationsQueryKey(),
      });
    } catch (error) {
      console.error("Error deleting organization:", error);
      alert("組織の削除に失敗しました");
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setFormData({
      name: "",
      display_name: "",
      type: EnumOrganizationType.household,
      slug: "",
      description: "",
    });
  };

  const typeLabels: Record<string, string> = {
    household: "家計簿",
    business: "ビジネス",
    nonprofit: "非営利",
    political_organization: "政治団体",
    other: "その他",
  };

  const formFields: FormField<OrganizationCreateForm>[] = [
    {
      name: "name",
      label: "名前（内部ID）",
      type: "text",
      required: true,
    },
    {
      name: "display_name",
      label: "表示名",
      type: "text",
      required: true,
    },
    {
      name: "slug",
      label: "スラッグ",
      type: "text",
      required: true,
    },
    {
      name: "type",
      label: "タイプ",
      type: "select",
      required: true,
      options: [
        { value: EnumOrganizationType.household, label: "家計簿" },
        { value: EnumOrganizationType.business, label: "ビジネス" },
        { value: EnumOrganizationType.nonprofit, label: "非営利" },
        {
          value: EnumOrganizationType.political_organization,
          label: "政治団体",
        },
        { value: EnumOrganizationType.other, label: "その他" },
      ],
    },
    {
      name: "description",
      label: "説明",
      type: "textarea",
      rows: 3,
    },
  ];

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
        <Button onClick={() => handleDelete(org.id)} variant="danger" size="sm">
          削除
        </Button>
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
        <Button onClick={() => setShowForm(true)} variant="primary">
          新規作成
        </Button>
      </div>

      <Modal open={showForm} onClose={handleCancel}>
        <h2 className="text-lg font-semibold mb-4">新規組織</h2>
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
        data={organizationList}
        columns={columns}
        keyExtractor={(org) => org.id}
        pageSize={20}
      />
    </div>
  );
}
