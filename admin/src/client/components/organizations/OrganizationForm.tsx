"use client";
import "client-only";

import { useState } from "react";
import { Button, Input, Selector } from "@/client/components/ui";
import type {
  Organization,
  OrganizationType,
} from "@/shared/models/organization";

interface OrganizationFormProps {
  organization?: Organization;
  onSubmit: (data: OrganizationFormData) => Promise<void>;
  submitLabel: string;
}

export interface OrganizationFormData {
  name: string;
  displayName: string;
  description?: string;
  type: OrganizationType;
  slug: string;
  settings?: Record<string, any>;
}

export default function OrganizationForm({
  organization,
  onSubmit,
  submitLabel,
}: OrganizationFormProps) {
  const [formData, setFormData] = useState<OrganizationFormData>({
    name: organization?.name ?? "",
    displayName: organization?.displayName ?? "",
    description: organization?.description ?? "",
    type: organization?.type ?? "household",
    slug: organization?.slug ?? "",
    settings: organization?.settings ?? {},
  });

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [hasError, setHasError] = useState(false);

  const organizationTypeOptions = [
    { value: "household", label: "家計簿" },
    { value: "business", label: "事業" },
    { value: "nonprofit", label: "非営利団体" },
    { value: "other", label: "その他" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");
    setHasError(false);

    try {
      await onSubmit(formData);
      if (!organization) {
        // Reset form for new organization
        setFormData({
          name: "",
          displayName: "",
          description: "",
          type: "household",
          slug: "",
          settings: {},
        });
      }
      setMessage(
        organization ? "組織が更新されました" : "組織が作成されました",
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "エラーが発生しました",
      );
      setHasError(true);
    } finally {
      setSubmitting(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: prev.slug === "" ? generateSlug(name) : prev.slug,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Input
          label="組織名"
          value={formData.name}
          onChange={handleNameChange}
          placeholder="組織の名前を入力してください"
          required
        />
      </div>

      <div>
        <Input
          label="表示名"
          value={formData.displayName}
          onChange={(value) =>
            setFormData((prev) => ({ ...prev, displayName: value }))
          }
          placeholder="画面に表示される名前を入力してください"
          required
        />
      </div>

      <div>
        <Selector
          label="組織タイプ"
          options={organizationTypeOptions}
          value={formData.type}
          onChange={(value) =>
            setFormData((prev) => ({
              ...prev,
              type: value as OrganizationType,
            }))
          }
          placeholder="組織タイプを選択してください"
          required
        />
      </div>

      <div>
        <Input
          label="スラッグ"
          value={formData.slug}
          onChange={(value) =>
            setFormData((prev) => ({ ...prev, slug: value }))
          }
          placeholder="URL用のスラッグを入力してください"
          required
        />
        <p className="text-sm text-gray-400 mt-1">
          URLで使用されます。英数字、ハイフン、アンダースコアのみ使用可能です。
        </p>
      </div>

      <div>
        <Input
          label="説明"
          value={formData.description}
          onChange={(value) =>
            setFormData((prev) => ({ ...prev, description: value }))
          }
          placeholder="組織の説明を入力してください（任意）"
          multiline
          rows={3}
        />
      </div>

      <div>
        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? "処理中..." : submitLabel}
        </Button>
      </div>

      {message && (
        <div
          className={`mt-4 p-3 rounded border ${
            hasError
              ? "text-red-500 bg-red-900/20 border-red-900/30"
              : "text-green-500 bg-green-900/20 border-green-900/30"
          }`}
        >
          {message}
        </div>
      )}
    </form>
  );
}
