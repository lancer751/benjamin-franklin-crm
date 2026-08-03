import { useParams } from "react-router-dom";
import { LeadEditForm } from "../components/lead-quick-form/LeadEditForm";
import { LeadQuickForm } from "../components/lead-quick-form/LeadQuickForm";

export default function LeadFormView() {
  const { id } = useParams<{ id: string }>();

  if (!id) return <LeadQuickForm />;
  return <LeadEditForm id={id} />;
}

