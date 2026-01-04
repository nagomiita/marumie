import { EnumCategoryType } from "@/client/api/generated/model";
import type { CategoryCreate } from "@/client/api/generated/model";
import Form, { type FormField } from "@/components/common/Form";

interface CategoryFormProps {
  formData: CategoryCreate;
  onChange: (data: CategoryCreate) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isEditing: boolean;
}

export default function CategoryForm({
  formData,
  onChange,
  onSubmit,
  onCancel,
  isEditing,
}: CategoryFormProps) {
  const formFields: FormField<CategoryCreate>[] = [
    {
      name: "id",
      label: "ID（英数字）",
      type: "text",
      required: true,
      disabled: isEditing,
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

  return (
    <Form
      fields={formFields}
      formData={formData}
      onChange={onChange}
      onSubmit={onSubmit}
      onCancel={onCancel}
      submitLabel={isEditing ? "更新" : "作成"}
    />
  );
}
