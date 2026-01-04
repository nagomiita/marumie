import { EnumOrganizationType } from "@/client/api/generated/model";
import Form, { type FormField } from "@/components/common/Form";

interface OrganizationCreateForm {
  name: string;
  display_name: string;
  type: EnumOrganizationType;
  slug: string;
  description: string;
}

interface OrganizationFormProps {
  formData: OrganizationCreateForm;
  onChange: (data: OrganizationCreateForm) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export default function OrganizationForm({
  formData,
  onChange,
  onSubmit,
  onCancel,
}: OrganizationFormProps) {
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

  return (
    <Form
      fields={formFields}
      formData={formData}
      onChange={onChange}
      onSubmit={onSubmit}
      onCancel={onCancel}
      submitLabel="作成"
    />
  );
}

export type { OrganizationCreateForm };
