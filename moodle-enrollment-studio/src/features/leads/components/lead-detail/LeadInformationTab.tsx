import { CalendarDays, Mail, MapPin, Phone, UserRound } from "lucide-react";
import { Card } from "@/core/components/ui/card";
import type { LeadDetail, LeadPhone } from "./leadDetail.types";
import { displayEnum, displayValue, formatLeadDate, personFullName } from "./leadDetail.formatters";

const Field = ({ icon: Icon, label, value }: { icon: typeof UserRound; label: string; value?: string | null }) => <div className="flex gap-3"><Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" /><div><p className="text-sm font-medium text-muted-foreground">{label}</p><p className="mt-1 text-sm leading-6">{displayValue(value)}</p></div></div>;

export function LeadInformationTab({ lead, principalPhone, additionalPhones }: { lead: LeadDetail; principalPhone?: LeadPhone; additionalPhones: LeadPhone[] }) {
  const cards = [
    { title: "Datos personales", icon: UserRound, fields: [
      [UserRound, "Nombre completo", personFullName(lead)], [UserRound, "DNI", lead.dni], [UserRound, "Género", displayEnum(lead.gender)], [UserRound, "Profesión", lead.profession],
    ] },
    { title: "Contacto", icon: Mail, fields: [
      [Mail, "Correo principal", lead.email], [Mail, "Correo secundario", lead.secondary_email], [Phone, "Celular principal", principalPhone?.number], [Phone, "Teléfonos adicionales", additionalPhones.map((phone) => phone.number).filter(Boolean).join(", ")],
    ] },
    { title: "Ubicación y registro", icon: MapPin, fields: [
      [MapPin, "Dirección principal", lead.address], [MapPin, "Dirección secundaria", lead.second_address], [CalendarDays, "Fecha de registro", formatLeadDate(lead.created_at)], [CalendarDays, "Última actualización", formatLeadDate(lead.updated_at)], [UserRound, "Estado del lead", displayEnum(lead.lead_status)],
    ] },
  ] as const;
  return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{cards.map(({ title, icon: Icon, fields }) => <Card key={title} className="p-5"><div className="mb-5 flex items-center gap-2"><Icon className="h-5 w-5 text-primary" /><h2 className="font-semibold">{title}</h2></div><div className="space-y-5">{fields.map(([FieldIcon, label, value]) => <Field key={label} icon={FieldIcon} label={label} value={value} />)}</div></Card>)}</div>;
}
