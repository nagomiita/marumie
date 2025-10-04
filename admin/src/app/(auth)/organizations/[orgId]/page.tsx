import "server-only";

import { notFound, redirect } from "next/navigation";
import OrganizationForm, {
  type OrganizationFormData,
} from "@/client/components/organizations/OrganizationForm";
import DeleteOrganizationButton from "@/client/components/organizations/DeleteOrganizationButton";
import { loadOrganizationData } from "@/server/loaders/load-organization-data";
import { updateOrganization } from "@/server/actions/update-organization";
import { deleteOrganization } from "@/server/actions/delete-organization";

interface Props {
  params: Promise<{
    orgId: string;
  }>;
}

export default async function OrganizationDetailPage({ params }: Props) {
  const { orgId } = await params;
  const organization = await loadOrganizationData(orgId);

  if (!organization) {
    notFound();
  }

  const handleUpdate = async (data: OrganizationFormData) => {
    "use server";

    const result = await updateOrganization({
      id: orgId,
      data,
    });

    if (!result.ok) {
      throw new Error(result.message || "組織の更新に失敗しました");
    }
  };

  const handleDelete = async (id: string) => {
    "use server";

    const result = await deleteOrganization({ id });

    if (result.ok) {
      redirect("/organizations");
    } else {
      throw new Error(result.message || "組織の削除に失敗しました");
    }
  };

  return (
    <div className="bg-primary-panel rounded-xl p-4">
      <h1 className="text-2xl font-bold text-white mb-6">組織編集</h1>

      <div className="max-w-2xl space-y-8">
        <OrganizationForm
          organization={organization}
          onSubmit={handleUpdate}
          submitLabel="組織を更新"
        />

        <div className="border-t border-primary-border pt-8">
          <h2 className="text-xl font-semibold text-white mb-4">危険な操作</h2>
          <DeleteOrganizationButton
            organizationId={organization.id}
            organizationName={organization.displayName}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
}
