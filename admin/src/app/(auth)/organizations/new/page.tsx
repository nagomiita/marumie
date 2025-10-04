import "server-only";

import { redirect } from "next/navigation";
import OrganizationForm, {
  type OrganizationFormData,
} from "@/client/components/organizations/OrganizationForm";
import { createOrganization } from "@/server/actions/create-organization";

export default function NewOrganizationPage() {
  const handleSubmit = async (data: OrganizationFormData) => {
    "use server";

    const result = await createOrganization(data);

    if (result.ok && result.organizationId) {
      redirect(`/organizations/${result.organizationId}`);
    } else {
      throw new Error(result.message || "組織の作成に失敗しました");
    }
  };

  return (
    <div className="bg-primary-panel rounded-xl p-4">
      <h1 className="text-2xl font-bold text-white mb-6">新しい組織を作成</h1>
      <div className="max-w-2xl">
        <OrganizationForm onSubmit={handleSubmit} submitLabel="組織を作成" />
      </div>
    </div>
  );
}
