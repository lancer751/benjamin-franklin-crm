import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Toaster as Sonner } from "@/core/components/ui/sonner";
import { Toaster } from "@/core/components/ui/toaster";
import { TooltipProvider } from "@/core/components/ui/tooltip";

// Auth & Store
import { useAuthStore } from "@/store/useAuthStore";
import { getMe } from "@/features/auth/services/authService";

// Layout y Core
import MainLayout from "@/core/components/MainLayout";
import NotFound from "@/core/views/NotFound";
import { ProtectedRoute } from "@/core/components/ProtectedRoute";

// Vistas Generales
import DashboardView from "@/features/dashboard/views/DashboardView";

// Módulo de Administración (Auth & Académico)
import LoginView from "@/features/auth/views/LoginView";
import UsersView from "@/features/users/views/UsersView";
import CoursesAdminView from "@/features/academic/views/CoursesAdminView";
import CourseDetailView from "@/features/academic/views/CourseDetailView";
import AcademicCalendarView from "@/features/academic/views/AcademicCalendarView";
import EditionDetailView from "@/features/academic/views/EditionDetailView";
import EditionFormView from "@/features/academic/views/EditionFormView";
import ProfessorsView from "@/features/academic/views/ProfessorsView";
import ProfessorDetailView from "@/features/academic/views/ProfessorDetailView";
import ProfessorFormView from "@/features/academic/views/ProfessorFormView";

// Módulo de Leads
import ProspectsView from "@/features/leads/views/ProspectsView";
import LeadDetailView from "@/features/leads/views/LeadDetailView";
import PipelineView from "@/features/leads/views/PipelineView";
import LeadFormView from "@/features/leads/views/LeadFormView";

// Módulo de Ventas (Orders & Products)
import OrdersView from "@/features/orders/views/OrdersView"; // Nueva Orden
import OrderDetailView from "@/features/orders/views/OrderDetailView";
import ProductsView from "@/features/products/views/ProductsView";
import ProductDetailView from "@/features/products/views/ProductDetailView";
import ProductFormView from "@/features/products/views/ProductFormView";

// Módulo de Finanzas
import FinanceDashboardView from "@/features/payments/views/FinanceDashboardView";
import PaymentsView from "@/features/payments/views/PaymentsView";
import PaymentDetailView from "@/features/payments/views/PaymentDetailView";
import PaymentPlansView from "@/features/payments/views/PaymentPlansView";
import OverdueView from "@/features/payments/views/OverdueView";

// Módulo de Campañas
import MarketingDashboardView from "@/features/campaigns/views/admin-marketing/MarketingDashboardView";
import CampaignsView from "@/features/campaigns/views/admin-marketing/CampaignsView";
import CampaignDetailView from "@/features/campaigns/views/CampaignDetailView";
import LeadSourcesView from "@/features/campaigns/views/admin-marketing/LeadSourcesView";
import SellerCampaignsView from "@/features/campaigns/views/seller/SellerCampaignsView";
import SellerLeadsView from "@/features/campaigns/views/seller/SellerLeadsView";
import UserDetailView from "@/features/users/views/UserDetailView";
import SupervisorFollowUpView from "@/features/leads/views/SupervisorFollowUpView";


const CampaignsRouteSwitcher = () => {
  const user = useAuthStore((state) => state.user);
  const userRole = user?.role?.name || "";
  
  if (userRole === "SALES_REP") {
    return <SellerCampaignsView />;
  }
  return <CampaignsView />;
};


const App = () => {
  const { setUser, setLoading, isLoading, user } = useAuthStore();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const isSalesRep = user?.role?.name === "SALES_REP";

  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await getMe();
        if (res && typeof res === "object" && "id" in res) {
          setUser(res as any);
        } else {
          setUser(null);
        }
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
        setIsCheckingAuth(false);
      }
    };

    initAuth();
  }, [setUser, setLoading]);

  if (isLoading || isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/" element={<LoginView />} />
          <Route path="/login" element={<Navigate to="/" replace />} />
          
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              {/* Dashboard General */}
              <Route path="/dashboard" element={<DashboardView />} />
              
              {/* Administración */}
              <Route path="/admin/usuarios" element={<UsersView />} />
              <Route path="/usuarios/:id" element={<UserDetailView />} />
              <Route path="/admin/cursos" element={<CoursesAdminView />} />
              <Route path="/admin/cursos/:id" element={<CourseDetailView />} />
              <Route path="/admin/calendario" element={<AcademicCalendarView />} />
              <Route path="/admin/academic/editions/nuevo" element={<EditionFormView />} />
              <Route path="/admin/academic/editions/:id" element={<EditionDetailView />} />
              <Route path="/admin/academic/editions/:id/editar" element={<EditionFormView />} />
              <Route path="/admin/profesores" element={<ProfessorsView />} />
              <Route path="/admin/profesores/nuevo" element={<ProfessorFormView />} />
              <Route path="/admin/profesores/:id" element={<ProfessorDetailView />} />
              <Route path="/admin/profesores/:id/editar" element={<ProfessorFormView />} />
              
              {/* Ventas & Prospectos */}
              <Route path="/prospectos" element={<ProspectsView />} />
              <Route path="/prospectos/nuevo" element={<LeadFormView />} />
              <Route path="/prospectos/:id" element={<LeadDetailView />} />
              <Route path="/prospectos/:id/editar" element={<LeadFormView />} />
              <Route path="/pipeline" element={<PipelineView />} />
              <Route path="/comercial/seguimiento-equipo" element={<SupervisorFollowUpView />} />
              <Route path="/ordenes" element={<OrdersView />} />
              <Route path="/ordenes/:id" element={<OrderDetailView />} />
              <Route path="/productos" element={<ProductsView />} />
              <Route path="/productos/nuevo" element={<ProductFormView />} />
              <Route path="/productos/:id/editar" element={<ProductFormView />} />
              <Route path="/productos/:id" element={<ProductDetailView />} />
              
              {/* Finanzas */}
              <Route path="/finanzas" element={<Navigate to="/pagos" replace />} />
              <Route path="/pagos" element={<PaymentsView />} />
              <Route path="/pagos/:id" element={<PaymentDetailView />} />
              <Route path="/planes-pago" element={<PaymentPlansView />} />
              <Route path="/morosos" element={<OverdueView />} />
              
              {/* Campañas */}
              <Route path="/marketing" element={<Navigate to="/admin/campanas" replace />} />
              <Route path="/admin/campanas" element={<CampaignsRouteSwitcher />} />
              <Route path="/admin/campanas/:id" element={<CampaignDetailView />} />
              <Route path="/campanas/:id" element={<CampaignDetailView />} />
              <Route path="/origen-leads" element={isSalesRep ? <Navigate to="/admin/campanas" replace /> : <LeadSourcesView />} />
              <Route path="/comercial/mis-leads" element={<SellerLeadsView />} />
              <Route path="/admin/campaigns/seller/leads/:campaignId" element={<SellerLeadsView />} />
              <Route path="/seller/campanas" element={<SellerCampaignsView />} />
              <Route path="/seller/campaigns" element={<SellerCampaignsView />} />
            </Route>
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  );
};

export default App;
