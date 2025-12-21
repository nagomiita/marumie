import { useState } from "react";
import {
  useListCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/client/api/generated/categories/categories";
import { EnumCategoryType } from "@/client/api/generated/model";
import type {
  CategoryCreate,
  CategoryRead,
} from "@/client/api/generated/model";
import DataTable, { type Column } from "@/components/common/DataTable";
import Modal from "@/components/common/Modal";
import Form, { type FormField } from "@/components/common/Form";
import Button from "@/components/common/Button";

export default function CategoriesPage() {
  const {
    data: categoriesData,
    isLoading: loading,
    refetch,
  } = useListCategories({ is_active: undefined });
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CategoryCreate>({
    id: "",
    name: "",
    group: "",
    color: "#3B82F6",
    short_label: "",
    type: EnumCategoryType.expense,
    display_order: 0,
    is_active: true,
  });

  const categories = Array.isArray(categoriesData?.data)
    ? categoriesData.data
    : [];

  const formFields: FormField<CategoryCreate>[] = [
    {
      name: "id",
      label: "ID（英数字）",
      type: "text",
      required: true,
      disabled: !!editingId,
      pattern: "[a-zA-Z0-9_]+",
      title: "英数字とアンダースコアのみ使用できます",
    },
    {
      name: "name",
      label: "カテゴリ名（日本語）",
      type: "text",
      required: true,
    },
    {
      name: "group",
      label: "グループ（大分類）",
      type: "text",
      required: true,
      placeholder: "例: 固定費、変動費、収入",
    },
    {
      name: "color",
      label: "表示色",
      type: "color",
      required: true,
    },
    {
      name: "short_label",
      label: "短縮ラベル",
      type: "text",
      required: true,
      maxLength: 10,
    },
    {
      name: "type",
      label: "種別",
      type: "select",
      required: true,
      options: [
        { value: EnumCategoryType.income, label: "収入" },
        { value: EnumCategoryType.expense, label: "支出" },
      ],
    },
    {
      name: "display_order",
      label: "表示順",
      type: "number",
    },
    {
      name: "is_active",
      label: "有効",
      type: "checkbox",
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          data: {
            name: formData.name,
            group: formData.group,
            color: formData.color,
            short_label: formData.short_label,
            type: formData.type,
            display_order: formData.display_order,
            is_active: formData.is_active,
          },
        });
      } else {
        await createMutation.mutateAsync({
          data: formData,
        });
      }

      setShowForm(false);
      setEditingId(null);
      setFormData({
        id: "",
        name: "",
        group: "",
        color: "#3B82F6",
        short_label: "",
        type: EnumCategoryType.expense,
        display_order: 0,
        is_active: true,
      });
      refetch();
    } catch (error) {
      console.error("Error saving category:", error);
      alert("カテゴリの保存に失敗しました");
    }
  };

  const handleEdit = (category: CategoryRead) => {
    setEditingId(category.id);
    setFormData({
      id: category.id,
      name: category.name,
      group: category.group,
      color: category.color,
      short_label: category.short_label,
      type: category.type,
      display_order: category.display_order,
      is_active: category.is_active,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("本当に削除しますか?(論理削除されます)")) return;

    try {
      await deleteMutation.mutateAsync({ id });
      refetch();
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("カテゴリの削除に失敗しました");
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      id: "",
      name: "",
      group: "",
      color: "#3B82F6",
      short_label: "",
      type: EnumCategoryType.expense,
      display_order: 0,
      is_active: true,
    });
  };

  const columns: Column<CategoryRead>[] = [
    {
      key: "id",
      label: "ID",
      sortable: true,
      className: "font-mono",
    },
    {
      key: "name",
      label: "カテゴリ名",
      sortable: true,
      filterable: true,
      filterType: "text",
    },
    {
      key: "group",
      label: "グループ",
      sortable: true,
      filterable: true,
      filterType: "select",
      filterOptions: Array.from(new Set(categories.map((c) => c.group))).sort(),
    },
    {
      key: "color",
      label: "色",
      render: (category) => (
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded border border-gray-300"
            style={{ backgroundColor: category.color }}
          />
          <span className="text-xs text-gray-600">{category.color}</span>
        </div>
      ),
    },
    {
      key: "type",
      label: "種別",
      sortable: true,
      filterable: true,
      filterType: "select",
      filterOptions: ["収入", "支出"],
      render: (category) => (
        <span
          className={`px-2 py-1 rounded text-xs ${
            category.type === EnumCategoryType.income
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {category.type === EnumCategoryType.income ? "収入" : "支出"}
        </span>
      ),
    },
    {
      key: "display_order",
      label: "表示順",
      sortable: true,
      className: "text-center",
    },
    {
      key: "is_active",
      label: "状態",
      sortable: true,
      filterable: true,
      filterType: "select",
      filterOptions: ["有効", "無効"],
      render: (category) => (
        <span
          className={`px-2 py-1 rounded text-xs ${
            category.is_active
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {category.is_active ? "有効" : "無効"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "操作",
      render: (category) => (
        <div className="flex gap-2">
          <Button
            onClick={() => handleEdit(category)}
            variant="ghost"
            size="sm"
          >
            編集
          </Button>
          <Button
            onClick={() => handleDelete(category.id)}
            variant="danger"
            size="sm"
          >
            削除
          </Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">読込中...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">カテゴリ管理</h1>
        <Button onClick={() => setShowForm(true)} variant="primary">
          新規作成
        </Button>
      </div>

      <Modal open={showForm} onClose={handleCancel}>
        <h2 className="text-lg font-semibold mb-4">
          {editingId ? "カテゴリ編集" : "新規カテゴリ"}
        </h2>
        <Form
          fields={formFields}
          formData={formData}
          onChange={setFormData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitLabel={editingId ? "更新" : "作成"}
        />
      </Modal>

      <DataTable
        data={categories}
        columns={columns}
        keyExtractor={(category) => category.id}
        pageSize={20}
      />
    </div>
  );
}
