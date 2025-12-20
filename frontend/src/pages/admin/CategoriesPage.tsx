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
          <button
            type="button"
            onClick={() => handleEdit(category)}
            className="text-blue-600 hover:text-blue-900"
          >
            編集
          </button>
          <button
            type="button"
            onClick={() => handleDelete(category.id)}
            className="text-red-600 hover:text-red-900"
          >
            削除
          </button>
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
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          新規作成
        </button>
      </div>

      {showForm && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingId ? "カテゴリ編集" : "新規カテゴリ"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="category_id"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                ID（英数字）
              </label>
              <input
                id="category_id"
                type="text"
                value={formData.id}
                onChange={(e) =>
                  setFormData({ ...formData, id: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
                disabled={!!editingId}
                pattern="[a-zA-Z0-9_]+"
                title="英数字とアンダースコアのみ使用できます"
              />
            </div>

            <div>
              <label
                htmlFor="category_name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                カテゴリ名（日本語）
              </label>
              <input
                id="category_name"
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label
                htmlFor="group"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                グループ（大分類）
              </label>
              <input
                id="group"
                type="text"
                value={formData.group}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    group: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="例: 固定費、変動費、収入"
                required
              />
            </div>

            <div>
              <label
                htmlFor="color"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                表示色
              </label>
              <input
                id="color"
                type="color"
                value={formData.color}
                onChange={(e) =>
                  setFormData({ ...formData, color: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label
                htmlFor="short_label"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                短縮ラベル
              </label>
              <input
                id="short_label"
                type="text"
                value={formData.short_label}
                onChange={(e) =>
                  setFormData({ ...formData, short_label: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
                maxLength={10}
              />
            </div>

            <div>
              <label
                htmlFor="category_type"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                種別
              </label>
              <select
                id="category_type"
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as EnumCategoryType,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              >
                <option value={EnumCategoryType.income}>収入</option>
                <option value={EnumCategoryType.expense}>支出</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="display_order"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                表示順
              </label>
              <input
                id="display_order"
                type="number"
                value={formData.display_order}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    display_order: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData({ ...formData, is_active: e.target.checked })
                }
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label
                htmlFor="is_active"
                className="ml-2 block text-sm text-gray-900"
              >
                有効
              </label>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                {editingId ? "更新" : "作成"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                キャンセル
              </button>
            </div>
          </form>
        </div>
      )}

      <DataTable
        data={categories}
        columns={columns}
        keyExtractor={(category) => category.id}
        pageSize={20}
      />
    </div>
  );
}
