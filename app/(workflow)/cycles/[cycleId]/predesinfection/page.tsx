import { PredesinfectionWizard } from "@/components/PredesinfectionWizard";

export default function PredesinfectionPage({
  params,
}: {
  params: { cycleId: string };
}) {
  const { cycleId } = params;
  return <PredesinfectionWizard cycleId={cycleId} />;
}

