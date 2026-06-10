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

// Módulo de Marketing
import MarketingDashboardView from "@/features/marketing/views/MarketingDashboardView";
import CampaignsView from "@/features/marketing/views/CampaignsView";
import CampaignDetailView from "@/features/marketing/views/CampaignDetailView";
import LeadSourcesView from "@/features/marketing/views/LeadSourcesView";
import UserDetailView from "@/features/users/views/UserDetailView";
import SupervisorFollowUpView from "@/features/users/views/SupervisorFollowUpView";


const App = () => {
  const { setUser, setLoading, isLoading } = useAuthStore();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await getMe();
        if (res && res.id) {
          setUser(res);
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
              
              {/* Marketing */}
              <Route path="/marketing" element={<Navigate to="/campanas" replace />} />
              <Route path="/campanas" element={<CampaignsView />} />
              <Route path="/campanas/:id" element={<CampaignDetailView />} />
              <Route path="/origen-leads" element={<LeadSourcesView />} />
            </Route>
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  );
};

export default App;
