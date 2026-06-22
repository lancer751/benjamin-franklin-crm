import { useState } from "react";
import { ArrowLeft, Phone, Mail, MessageCircle, Calendar, User, MapPin, Briefcase, Plus, X, Globe, ShoppingCart, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { getLeadById, getLeadInteractions, createInteraction } from "../services/leadService";
import { toast } from "sonner";

const typeIcons: Record<string, { icon: typeof Phone; color: string; bg: string }> = {
  CALL: { icon: Phone, color: "text-blue-600", bg: "bg-blue-100" },
  WHATSAPP: { icon: MessageCircle, color: "text-emerald-600", bg: "bg-emerald-100" },
  EMAIL: { icon: Mail, color: "text-purple-600", bg: "bg-purple-100" },
  MEETING: { icon: Calendar, color: "text-orange-600", bg: "bg-orange-100" },
  WEBSITE_FORM: { icon: Globe, color: "text-indigo-600", bg: "bg-indigo-100" },
  SELL: { icon: ShoppingCart, color: "text-red-600", bg: "bg-red-100" },
};

const stageColors: Record<string, string> = {
  Prospecto: "bg-blue-100 text-blue-700",
  Interesado: "bg-yellow-100 text-yellow-700",
  Cliente: "bg-emerald-100 text-emerald-700",
  PENDING: "bg-blue-100 text-blue-700",
  CONTACTED: "bg-yellow-100 text-yellow-700",
  CONVERTED: "bg-emerald-100 text-emerald-700",
};

const LeadDetailView = () => {
  // const { id } = useParams<{ id: string }>();
  // const navigate = useNavigate();
  // const queryClient = useQueryClient();
  
  // const [showModal, setShowModal] = useState(false);
  // const [newInteraction, setNewInteraction] = useState({ type: "CALL", notes: "" });

  // // 1. Fetch Lead
  // const { data: leadDataRes, isLoading: isLoadingLead } = useQuery({
  //   queryKey: ["lead", id],
  //   queryFn: () => getLeadById(id!),
  //   enabled: !!id,
  // });

  // // 2. Fetch Interactions
  // const { data: interactionsRes, isLoading: isLoadingInteractions } = useQuery({
  //   queryKey: ["leadInteractions", id],
  //   queryFn: () => getLeadInteractions(id!),
  //   enabled: !!id,
  // });

  // const lead = (leadDataRes as any)?.data || leadDataRes || null;
  // const interactions = Array.isArray(interactionsRes) ? interactionsRes : (interactionsRes as any)?.data || [];

  // // 3. Mutación para nueva interacción
  // const interactionMutation = useMutation({
  //   mutationFn: (payload: any) => createInteraction(payload),
  //   onSuccess: () => {
  //     toast.success("Interacción registrada correctamente");
  //     queryClient.invalidateQueries({ queryKey: ["leadInteractions", id] });
  //     setShowModal(false);
  //     setNewInteraction({ type: "CALL", notes: "" });
  //   },
  //   onError: () => {
  //     toast.error("Error al registrar la interacción");
  //   }
  // });

  // const handleCreateInteraction = () => {
  //   if (!newInteraction.notes.trim()) {
  //     toast.error("Debes agregar una nota descriptiva");
  //     return;
  //   }
    
  //   const payload = {
  //     lead_id: id,
  //     type: newInteraction.type,
  //     notes: newInteraction.notes,
  //     campaing_id: lead?.primary_campaign_id || undefined,
  //   };
    
  //   interactionMutation.mutate(payload);
  // };

  // if (isLoadingLead || isLoadingInteractions) {
  //   return (
  //     <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground">
  //       <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
  //       <p>Cargando información del prospecto...</p>
  //     </div>
  //   );
  // }

  // if (!lead) {
  //   return (
  //     <div className="flex flex-col items-center justify-center h-[60vh] text-destructive">
  //       <p className="font-bold text-lg">No se pudo cargar el prospecto o no existe.</p>
  //       <button onClick={() => navigate("/admin/prospectos")} className="btn-secondary mt-4">Volver a Prospectos</button>
  //     </div>
  //   );
  // }

  // const renderValue = (value: any) => {
  //   if (value === null || value === undefined || value === "") {
  //     return <span className="text-muted-foreground/50">No especificado</span>;
  //   }
  //   // Traducir géneros si vienen en ENUM
  //   if (value === "MALE") return "Masculino";
  //   if (value === "FEMALE") return "Femenino";
  //   if (value === "NOT_SPECIFIED") return <span className="text-muted-foreground/50">No especificado</span>;
  //   return value;
  // };

  return (
    // <div className="space-y-6">
    //   {/* Back */}
    //   <button onClick={() => navigate("/prospectos")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
    //     <ArrowLeft size={16} /> Volver a Prospectos
    //   </button>

    //   {/* Header */}
    //   <div className="flex items-start justify-between">
    //     <div className="flex items-center gap-4">
    //       <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary uppercase">
    //         {lead.first_name?.[0] || ""}{lead.last_name?.[0] || ""}
    //       </div>
    //       <div>
    //         <h1 className="text-2xl font-bold text-foreground">{lead.first_name} {lead.last_name}</h1>
    //         <p className="text-sm text-muted-foreground mt-0.5">{lead.id} {lead.origin && `• ${lead.origin}`}</p>
    //         <span className={`mt-1.5 inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-bold tracking-wide ${stageColors[lead.lead_status || lead.status || "Prospecto"] || "bg-muted text-muted-foreground"}`}>
    //           {lead.lead_status || lead.status || "Prospecto"}
    //         </span>
    //       </div>
    //     </div>
    //     <div className="flex items-center gap-2">
    //       {lead.cellphone && <button className="btn-secondary text-xs px-3 py-2"><Phone size={14} /> Llamar</button>}
    //       {lead.cellphone && <button className="btn-secondary text-xs px-3 py-2"><MessageCircle size={14} /> WhatsApp</button>}
    //       <button className="btn-primary text-xs px-3 py-2" onClick={() => navigate('/admin/ordenes/nueva')}>Crear Orden</button>
    //     </div>
    //   </div>

    //   <div className="grid grid-cols-5 gap-6">
    //     {/* Left: Profile */}
    //     <div className="col-span-2 space-y-6">
    //       <div className="rounded-xl bg-card border border-border p-6">
    //         <h3 className="font-bold text-foreground mb-4">Información Personal</h3>
    //         <div className="space-y-4">
    //           {[
    //             { icon: Mail, label: "Email", value: lead.email },
    //             { icon: User, label: "DNI", value: lead.dni },
    //             { icon: User, label: "Género", value: lead.gender },
    //             { icon: Briefcase, label: "Profesión", value: lead.profession },
    //             { icon: MapPin, label: "Dirección", value: lead.address },
    //           ].map((f, i) => (
    //             <div key={i} className="flex items-start gap-3">
    //               <f.icon size={16} className="text-muted-foreground mt-0.5 shrink-0" />
    //               <div>
    //                 <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{f.label}</p>
    //                 <p className="text-sm text-foreground mt-0.5">{renderValue(f.value)}</p>
    //               </div>
    //             </div>
    //           ))}
    //         </div>
    //       </div>

    //       <div className="rounded-xl bg-card border border-border p-6">
    //         <h3 className="font-bold text-foreground mb-4">Interés Comercial</h3>
    //         <div className="space-y-3">
    //           <div className="flex justify-between text-sm">
    //             <span className="text-muted-foreground">ID Campaña</span>
    //             <span className="font-medium text-foreground">{renderValue(lead.primary_campaign_id)}</span>
    //           </div>
    //           <div className="flex justify-between text-sm">
    //             <span className="text-muted-foreground">Moodle User ID</span>
    //             <span className="font-medium text-foreground">{renderValue(lead.moodle_user_id)}</span>
    //           </div>
    //           <div className="flex justify-between text-sm">
    //             <span className="text-muted-foreground">Fecha registro</span>
    //             <span className="font-medium text-foreground">
    //               {lead.created_at ? new Date(lead.created_at).toLocaleDateString("es-PE", { year: 'numeric', month: 'long', day: 'numeric' }) : renderValue(null)}
    //             </span>
    //           </div>
    //         </div>
    //       </div>
    //     </div>

    //     {/* Right: Timeline */}
    //     <div className="col-span-3">
    //       <div className="rounded-xl bg-card border border-border p-6">
    //         <div className="flex items-center justify-between mb-6">
    //           <h3 className="font-bold text-foreground">Línea de Tiempo</h3>
    //           <button onClick={() => setShowModal(true)} className="btn-primary text-xs px-3 py-2">
    //             <Plus size={14} /> Nueva Interacción
    //           </button>
    //         </div>

    //         <div className="relative">
    //           {/* Vertical line */}
    //           {interactions.length > 0 && <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />}

    //           <div className="space-y-6">
    //             {interactions.length === 0 ? (
    //               <p className="text-sm text-muted-foreground text-center py-4">No hay interacciones registradas.</p>
    //             ) : (
    //               interactions.map((event: any, i: number) => {
    //                 const typeInfo = typeIcons[event.type] || { icon: MessageCircle, color: "text-gray-600", bg: "bg-gray-100" };
    //                 const Icon = typeInfo.icon;
    //                 return (
    //                   <div key={event.id || i} className="relative flex gap-4 pl-2">
    //                     <div className={`relative z-10 h-10 w-10 rounded-full ${typeInfo.bg} flex items-center justify-center shrink-0`}>
    //                       <Icon size={16} className={typeInfo.color} />
    //                     </div>
    //                     <div className="flex-1 pb-2">
    //                       <div className="flex items-start justify-between">
    //                         <div>
    //                           <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wide ${typeInfo.bg} ${typeInfo.color}`}>
    //                             {event.type}
    //                           </span>
    //                         </div>
    //                         <div className="text-right">
    //                           <p className="text-xs text-muted-foreground">
    //                             {event.created_at ? new Date(event.created_at).toLocaleString("es-PE") : "Desconocido"}
    //                           </p>
    //                         </div>
    //                       </div>
    //                       <p className="text-sm text-foreground mt-2">{event.notes}</p>
    //                       <p className="text-xs text-muted-foreground mt-1 font-medium">Por: {event.created_by || "Sistema"}</p>
    //                     </div>
    //                   </div>
    //                 );
    //               })
    //             )}
    //           </div>
    //         </div>
    //       </div>
    //     </div>
    //   </div>

    //   {/* New Interaction Modal */}
    //   {showModal && (
    //     <div className="modal-overlay" onClick={() => setShowModal(false)}>
    //       <div className="modal-container max-w-lg" onClick={(e) => e.stopPropagation()}>
    //         <div className="flex items-center justify-between p-6 border-b border-border">
    //           <h2 className="text-lg font-bold text-foreground">Nueva Interacción</h2>
    //           <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground disabled:opacity-50" disabled={interactionMutation.isPending}>
    //             <X size={20} />
    //           </button>
    //         </div>
    //         <div className="p-6 space-y-4">
    //           <div>
    //             <label className="form-label">Tipo</label>
    //             <select className="form-select" value={newInteraction.type} onChange={(e) => setNewInteraction(p => ({ ...p, type: e.target.value }))} disabled={interactionMutation.isPending}>
    //               <option value="CALL">Llamada Telefónica</option>
    //               <option value="WHATSAPP">Mensaje de WhatsApp</option>
    //               <option value="EMAIL">Correo Electrónico</option>
    //               <option value="MEETING">Reunión / Videollamada</option>
    //             </select>
    //           </div>
    //           <div>
    //             <label className="form-label">Notas descriptivas</label>
    //             <textarea 
    //               className="form-input min-h-[120px]" 
    //               placeholder="Detalle de la interacción... (Max 255 caracteres)" 
    //               maxLength={255}
    //               value={newInteraction.notes} 
    //               onChange={(e) => setNewInteraction(p => ({ ...p, notes: e.target.value }))} 
    //               disabled={interactionMutation.isPending}
    //             />
    //             <p className="text-xs text-muted-foreground mt-1 text-right">{newInteraction.notes.length}/255</p>
    //           </div>
    //         </div>
    //         <div className="flex justify-end gap-3 p-6 border-t border-border bg-muted/30">
    //           <button className="btn-secondary" onClick={() => setShowModal(false)} disabled={interactionMutation.isPending}>Cancelar</button>
    //           <button className="btn-primary" onClick={handleCreateInteraction} disabled={interactionMutation.isPending}>
    //             {interactionMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
    //             Registrar Interacción
    //           </button>
    //         </div>
    //       </div>
    //     </div>
    //   )}
    // </div>
    <></>
  );
};

export default LeadDetailView;
