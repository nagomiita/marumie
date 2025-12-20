import { useState } from "react";
import Card from "./Card";
import Form, { type FormField } from "./Form";

export interface LoginCardProps {
  title: string;
  onSubmit: (email: string, password: string) => Promise<void>;
  submitButtonText?: string;
  submittingText?: string;
}

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginCard({
  title,
  onSubmit,
  submitButtonText = "ログイン",
  submittingText = "ログイン中...",
}: LoginCardProps) {
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formFields: FormField<LoginFormData>[] = [
    {
      name: "email",
      label: "メールアドレス",
      type: "email",
      required: true,
      placeholder: "メールアドレス",
    },
    {
      name: "password",
      label: "パスワード",
      type: "password",
      required: true,
      placeholder: "パスワード",
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await onSubmit(formData.email, formData.password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ログインに失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-8">
          {title}
        </h2>
        <Card>
          {error && (
            <div className="rounded-md bg-red-50 p-4 mb-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          <Form
            fields={formFields}
            formData={formData}
            onChange={setFormData}
            onSubmit={handleSubmit}
            submitLabel={isSubmitting ? submittingText : submitButtonText}
          />
        </Card>
      </div>
    </div>
  );
}
