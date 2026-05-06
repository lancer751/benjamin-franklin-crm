import { useState } from "react";
import { Search, Bell, HelpCircle, Plus, Trash2, Pencil } from "lucide-react";
import AppSidebar from "@/core/components/AppSidebar";
import ProspectForm from "@/features/leads/components/ProspectForm";
import CampaignForm from "@/features/marketing/components/CampaignForm";
import EditionPricingForm from "@/features/orders/components/ProductFormModal";
import PaymentForm from "@/features/payments/components/PaymentForm";
import DeleteConfirmModal from "@/core/components/DeleteConfirmModal";
import AcademicCalendarView from "@/features/academic/views/AcademicCalendarView";

const Index = () => {
  const [activePage, setActivePage] = useState("prospectos");
  const [prospectOpen, setProspectOpen] = useState(false);
  const [campaignOpen, setCampaignOpen] = useState(false);
  const [editionOpen, setEditionOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Edit mode demos
  const [editProspect, setEditProspect] = useState(false);

  const sampleProspect = {
    nombres: "Ricardo Javier",
    apellidoPaterno: "Mendoza",
    apellidoMaterno: "Salazar",
    dni: "12345678",
    email: "ricardo@email.com",
    celular: "+51 900 000 000",
    genero: "masculino",
    profesion: "ingeniero",
    leadStage: "interesado",
  };

  const cards = [
    { id: "prospect-new", label: "Nuevo Prospecto", desc: "Formulario de registro de prospectos", action: () => { setEditProspect(false); setProspectOpen(true); } },
    { id: "prospect-edit", label: "Editar Prospecto", desc: "Modo edición con datos precargados", action: () => { setEditProspect(true); setProspectOpen(true); } },
    { id: "campaign", label: "Nueva Campaña", desc: "Crear campaña de captación", action: () => setCampaignOpen(true) },
    { id: "edition", label: "Nueva Edición y Precio", desc: "Configurar cohorte y precios", action: () => setEditionOpen(true) },
    { id: "payment", label: "Registrar Pago", desc: "Registrar ingreso de fondos", action: () => setPaymentOpen(true) },
    { id: "delete", label: "Eliminar Registro", desc: "Modal de confirmación destructiva", action: () => setDeleteOpen(true), destructive: true },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar active={activePage} onNavigate={setActivePage} />

      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="h-16 flex items-center justify-between px-8 bg-card border-b border-border">
          <div className="flex items-center gap-3 flex-1 max-w-lg">
            <Search size={18} className="text-muted-foreground" />
            <input className="bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none flex-1" placeholder="Buscar en la plataforma..." />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-medium text-muted-foreground bg-muted px-3 py-1.5 rounded-md">ROL: SALES_REP</span>
            <Bell size={18} className="text-muted-foreground" />
            <HelpCircle size={18} className="text-muted-foreground" />
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">MA</div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-8">
          {activePage === "calendario" ? (
            <AcademicCalendarView />
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-foreground">Demo de Modales — CRM</h1>
                <p className="text-sm text-muted-foreground mt-1">Haz clic en cualquier tarjeta para abrir el formulario correspondiente.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {cards.map((card) => (
                  <button
                    key={card.id}
                    onClick={card.action}
                    className="group bg-card rounded-xl border border-border p-6 text-left hover:shadow-lg hover:border-primary/30 transition-all"
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${card.destructive ? "bg-destructive/10" : "bg-primary/10"
                      }`}>
                      {card.destructive
                        ? <Trash2 size={18} className="text-destructive" />
                        : card.id.includes("edit")
                          ? <Pencil size={18} className="text-primary" />
                          : <Plus size={18} className="text-primary" />
                      }
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">{card.label}</h3>
                    <p className="text-sm text-muted-foreground">{card.desc}</p>
                  </button>
                ))}
              </div>
            </>
          )}
        </main>
      </div>

      {/* Modals */}
      <ProspectForm
        open={prospectOpen}
        onClose={() => setProspectOpen(false)}
        initialData={editProspect ? sampleProspect : undefined}
        onSubmit={(data) => console.log("Prospect:", data)}
      />
      <CampaignForm
        open={campaignOpen}
        onClose={() => setCampaignOpen(false)}
        onSubmit={(data) => console.log("Campaign:", data)}
      />
      <EditionPricingForm
        open={editionOpen}
        onClose={() => setEditionOpen(false)}
        onSubmit={(data) => console.log("Edition:", data)}
      />
      <PaymentForm
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        onSubmit={(data) => console.log("Payment:", data)}
      />
      <DeleteConfirmModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => console.log("Deleted!")}
        itemName="Ricardo Javier Mendoza"
        itemType="Prospecto"
      />
    </div>
  );
};

export default Index;
