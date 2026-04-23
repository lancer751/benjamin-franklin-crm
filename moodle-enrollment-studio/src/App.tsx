import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/core/components/ui/sonner";
import { Toaster } from "@/core/components/ui/toaster";
import { TooltipProvider } from "@/core/components/ui/tooltip";

// Layout y Core
import MainLayout from "@/core/components/MainLayout";
import NotFound from "@/core/views/NotFound";

// Vistas Generales
import DashboardView from "@/dashboard/views/DashboardView";

// Módulo de Administración (Auth & Académico)
import UsersView from "@/auth/views/UsersView";
import CoursesAdminView from "@/academic/views/CoursesAdminView";
import CourseDetailView from "./academic/views/CourseDetailView";

// Módulo de Leads
import ProspectsView from "@/leads/views/ProspectsView";
import LeadDetailView from "@/leads/views/LeadDetailView";
import PipelineView from "@/leads/views/PipelineView";

// Módulo de Ventas (Orders & Products)
import OrdersView from "@/orders/views/OrdersView"; // Nueva Orden
import OrderDetailView from "@/orders/views/OrderDetailView";
import ProductsView from "@/orders/views/ProductsView";
import ProductDetailView from "@/orders/views/ProductDetailView";

// Módulo de Finanzas
import FinanceDashboardView from "@/payments/views/FinanceDashboardView";
import PaymentsView from "@/payments/views/PaymentsView";
import PaymentDetailView from "@/payments/views/PaymentDetailView";
import PaymentPlansView from "@/payments/views/PaymentPlansView";
import OverdueView from "@/payments/views/OverdueView";

// Módulo de Marketing
import MarketingDashboardView from "@/marketing/views/MarketingDashboardView";
import CampaignsView from "@/marketing/views/CampaignsView";
import CampaignDetailView from "@/marketing/views/CampaignDetailView";
import LeadSourcesView from "@/marketing/views/LeadSourcesView";
import UserDetailView from "./auth/views/UserDetailView";


const App = () => (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            {/* Redirección por defecto */}
            <Route index element={<Navigate to="/dashboard" replace />} />
            
            {/* Dashboard General */}
            <Route path="dashboard" element={<DashboardView />} />
            
            {/* Administración */}
            <Route path="admin/usuarios" element={<UsersView />} />
            <Route path="usuarios/:id" element={<UserDetailView />} />
            <Route path="admin/cursos" element={<CoursesAdminView />} />
            <Route path="admin/cursos/:id" element={<CourseDetailView />} />
            
            {/* Ventas & Prospectos */}
            <Route path="prospectos" element={<ProspectsView />} />
            <Route path="prospectos/:id" element={<LeadDetailView />} />
            <Route path="pipeline" element={<PipelineView />} />
            <Route path="ordenes" element={<OrdersView />} />
            <Route path="ordenes/:id" element={<OrderDetailView />} />
            <Route path="productos" element={<ProductsView />} />
            <Route path="/productos/:id" element={<ProductDetailView />} />
            
            {/* Finanzas */}
            <Route path="finanzas" element={<FinanceDashboardView />} />
            <Route path="pagos" element={<PaymentsView />} />
            <Route path="pagos/:id" element={<PaymentDetailView />} />
            <Route path="planes-pago" element={<PaymentPlansView />} />
            <Route path="morosos" element={<OverdueView />} />
            
            {/* Marketing */}
            <Route path="marketing" element={<MarketingDashboardView />} />
            <Route path="campanas" element={<CampaignsView />} />
            <Route path="campanas/:id" element={<CampaignDetailView />} />
            <Route path="origen-leads" element={<LeadSourcesView />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
);

export default App;
