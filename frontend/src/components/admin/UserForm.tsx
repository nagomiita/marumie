import { EnumUserRole } from "@/client/api/generated/model";
import Form, { type FormField } from "@/components/common/Form";

interface UserCreateForm {
  name: string;
  email: string;
  password: string;
  role: EnumUserRole;
}

interface UserFormProps {
  formData: UserCreateForm;
  onChange: (data: UserCreateForm) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export default function UserForm({
  formData,
  onChange,
  onSubmit,
  onCancel,
}: UserFormProps) {
  const formFields: FormField<UserCreateForm>[] = [
    {
      name: "name",
      label: "名前",
      type: "text",
      required: true,
    },
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

export type { UserCreateForm };
