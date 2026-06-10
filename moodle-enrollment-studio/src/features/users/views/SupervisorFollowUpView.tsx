import { useState, useMemo } from "react";
import { 
  Users, 
  TrendingUp, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  Phone, 
  BookOpen, 
  Layers,
  MessageSquare,
  Copy,
  Mail,
  Award,
  Hash,
  AlertCircle
} from "lucide-react";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from "@/core/components/ui/table";
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from "@/core/components/ui/tabs";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from "@/core/components/ui/card";
import { Badge } from "@/core/components/ui/badge";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle 
} from "@/core/components/ui/sheet";
import { toast } from "sonner";

// Enriched mock data matching the schema.prisma rules and high-density classifications
const mockSellersData = [
  {
    id: "seller-1",
    name: "VERÓNICA PINTO",
    email: "vpinto@benjaminfranklin.edu.pe",
    avatar: "VP",
    metrics: {
      totalLeads: 24,
      converted: 4,
      salesVal: 5200,
    },
    prospects: [
      {
        id: "p-101",
        createdAt: "10/06/2026 09:30",
        course: "CEBA - Educación de Adultos",
        phone: "987654321",
        fullName: "Juan Carlos Mendoza",
        dni: "72849104",
        email: "jmendoza@gmail.com",
        campaign: "Campaña CEBA Invierno 2026",
        info_status: "Enviado",
        estado: "CONTACTADO",
        subestado: "EFECTIVO",
        detalle_motivo: "VOLVER A LLAMAR",
        notes: "Conversé con Juan. Se encuentra muy interesado en culminar su secundaria. Solicitó que lo llame de nuevo hoy a las 6:00 pm después de su horario de trabajo para definir las cuotas y realizar el pago de matrícula.",
      },
      {
        id: "p-102",
        createdAt: "10/06/2026 10:15",
        course: "Maestro de Obras",
        phone: "912345678",
        fullName: "María del Pilar Ruiz",
        dni: "45987123",
        email: "mruiz@outlook.com",
        campaign: "Cursos Técnicos 2026",
        info_status: "Pendiente",
        estado: "NO CONTACTADO",
        subestado: "NO CONTESTA",
        detalle_motivo: "CASILLA DE VOZ",
        notes: "Primer intento fallido, sonó ocupado. La llamada fue enviada directamente a la casilla de voz. Se volverá a intentar la llamada el día de mañana por la mañana.",
      },
      {
        id: "p-103",
        createdAt: "09/06/2026 15:45",
        course: "Excel Profesional para Negocios",
        phone: "956789012",
        fullName: "Pedro Alcántara Vargas",
        dni: "10293847",
        email: "pedro.vargas@gmail.com",
        campaign: "Remarketing Corporativo",
        info_status: "Enviado",
        estado: "CONTACTADO",
        subestado: "NO EFECTIVO",
        detalle_motivo: "NO INTERESADO POR PRECIOS",
        notes: "Se le explicó a detalle la estructura del programa de Excel Profesional. Menciona que no cuenta con el presupuesto necesario en estos momentos debido a gastos familiares y considera que el costo de la matrícula es elevado.",
      },
      {
        id: "p-104",
        createdAt: "09/06/2026 11:20",
        course: "CEBA - Educación de Adultos",
        phone: "945678123",
        fullName: "Ana Lucía Paredes",
        dni: "76543210",
        email: "alucia.paredes@gmail.com",
        campaign: "Campaña CEBA Invierno 2026",
        info_status: "Enviado",
        estado: "PREVENTA - CITA",
        subestado: "PENDIENDE DE PAGO",
        detalle_motivo: "MUY INTERESADO",
        notes: "Ana está muy interesada en inscribirse. Quedó en realizar el depósito del pago inicial de matrícula junto con su esposo por la tarde. Envié los números de cuenta corriente de la corporación por WhatsApp.",
      },
      {
        id: "p-105",
        createdAt: "08/06/2026 14:10",
        course: "Maestro de Obras",
        phone: "934567890",
        fullName: "Luis Alberto Torres",
        dni: "34908123",
        email: "latorres@hotmail.com",
        campaign: "Cursos Técnicos 2026",
        info_status: "Enviado",
        estado: "CONTACTADO",
        subestado: "MATRICULADO",
        detalle_motivo: null,
        notes: "Inscripción completada exitosamente. Se procesó el pago al contado de la matrícula y la primera cuota mensual. Se le derivó la ficha de matrícula y el reglamento del alumno al correo registrado.",
      }
    ]
  },
  {
    id: "seller-2",
    name: "RUTH HUAMÁN",
    email: "rhuaman@benjaminfranklin.edu.pe",
    avatar: "RH",
    metrics: {
      totalLeads: 18,
      converted: 3,
      salesVal: 3850,
    },
    prospects: [
      {
        id: "p-201",
        createdAt: "10/06/2026 08:45",
        course: "Maestro de Obras",
        phone: "921098765",
        fullName: "Carlos Estacio Quispe",
        dni: "08765432",
        email: "cestacio@gmail.com",
        campaign: "Cursos Técnicos 2026",
        info_status: "Enviado",
        estado: "CONTACTADO",
        subestado: "EFECTIVO",
        detalle_motivo: "VOLVER A LLAMAR",
        notes: "Llamar el viernes por la mañana para confirmar financiamiento del programa. Desea que le coticemos en 3 cuotas mensuales sin intereses.",
      },
      {
        id: "p-202",
        createdAt: "09/06/2026 17:30",
        course: "CEBA - Educación de Adultos",
        phone: "987012345",
        fullName: "Francisca Mamani Choque",
        dni: "12345678",
        email: "francisca.mamani@gmail.com",
        campaign: "Campaña CEBA Invierno 2026",
        info_status: "Pendiente",
        estado: "NO CONTACTADO",
        subestado: "NO CONTESTA",
        detalle_motivo: "CASILLA DE VOZ",
        notes: "Llamada directa al buzón en dos intentos seguidos por la tarde. Se enviará mensaje automático por WhatsApp.",
      },
      {
        id: "p-203",
        createdAt: "09/06/2026 12:00",
        course: "Asistente Administrativo",
        phone: "976543210",
        fullName: "Sofía Lorena Benítez",
        dni: "65432109",
        email: "sbenitez@gmail.com",
        campaign: "Secretariado & Admin 2026",
        info_status: "Enviado",
        estado: "PREVENTA - CITA",
        subestado: "EFECTIVO",
        detalle_motivo: "MUY INTERESADO",
        notes: "Confirmó asistencia para la charla informativa virtual de este jueves sobre las competencias del asistente administrativo del futuro.",
      },
      {
        id: "p-204",
        createdAt: "08/06/2026 16:15",
        course: "Maestro de Obras",
        phone: "990887766",
        fullName: "Jorge Lino Huayta",
        dni: "23456789",
        email: "jhuayta@outlook.com",
        campaign: "Cursos Técnicos 2026",
        info_status: "Enviado",
        estado: "CONTACTADO",
        subestado: "NO EFECTIVO",
        detalle_motivo: "NO INTERESADO POR HORARIOS",
        notes: "Se desanimó debido a que las clases presenciales son exclusivamente los fines de semana (sábados de 2 a 6 pm y domingos de 9 am a 1 pm), y labora los sábados por la tarde.",
      }
    ]
  },
  {
    id: "seller-3",
    name: "ANA GÓMEZ",
    email: "agomez@benjaminfranklin.edu.pe",
    avatar: "AG",
    metrics: {
      totalLeads: 22,
      converted: 3,
      salesVal: 3400,
    },
    prospects: [
      {
        id: "p-301",
        createdAt: "10/06/2026 11:10",
        course: "CEBA - Educación de Adultos",
        phone: "944556677",
        fullName: "Teresa de Jesús Flores",
        dni: "87654321",
        email: "tflores@gmail.com",
        campaign: "Campaña CEBA Invierno 2026",
        info_status: "Enviado",
        estado: "PREVENTA - CITA",
        subestado: "PENDIENDE DE PAGO",
        detalle_motivo: "MUY INTERESADO",
        notes: "Teresa nos envió la foto de su DNI. Se encuentra a la espera del link de la pasarela de pagos para realizar el abono correspondiente a la matrícula de CEBA.",
      },
      {
        id: "p-302",
        createdAt: "10/06/2026 09:15",
        course: "Excel Profesional para Negocios",
        phone: "911223344",
        fullName: "Roberto Carlos Díaz",
        dni: "98765432",
        email: "rcarlos.diaz@gmail.com",
        campaign: "Remarketing Corporativo",
        info_status: "Pendiente",
        estado: "NO CONTACTADO",
        subestado: "NO CONTESTA",
        detalle_motivo: "CASILLA DE VOZ",
        notes: "Timbra insistentemente pero no atiende la llamada. No registra WhatsApp activo. Se agendará nuevo contacto para el turno de la tarde.",
      },
      {
        id: "p-303",
        createdAt: "09/06/2026 16:50",
        course: "Maestro de Obras",
        phone: "988776655",
        fullName: "Raúl Eduardo Sánchez",
        dni: "12309845",
        email: "rsanchez.maestro@gmail.com",
        campaign: "Cursos Técnicos 2026",
        info_status: "Enviado",
        estado: "CONTACTADO",
        subestado: "EFECTIVO",
        detalle_motivo: "VOLVER A LLAMAR",
        notes: "Consultará con su empleador actual si le brindarán facilidades de horario para realizar la parte práctica de campo los fines de semana. Devolver llamada el viernes.",
      },
      {
        id: "p-304",
        createdAt: "08/06/2026 10:30",
        course: "Asistente Administrativo",
        phone: "966554433",
        fullName: "Clara Inés Beltrán",
        dni: "43210987",
        email: "cbeltran@gmail.com",
        campaign: "Secretariado & Admin 2026",
        info_status: "Enviado",
        estado: "CONTACTADO",
        subestado: "NO EFECTIVO",
        detalle_motivo: "NO INTERESADO POR PRECIOS",
        notes: "Prefiere un programa de menor duración y de modalidad 100% online y asincrónica para acoplarse a sus actividades personales. El precio del ciclo le parece elevado.",
      }
    ]
  }
];

const SupervisorFollowUpView = () => {
  const [activeSellerTab, setActiveSellerTab] = useState(mockSellersData[0].id);
  const [selectedLead, setSelectedLead] = useState<any>(null);

  // Status-based color mapping for Table Badges (main "estado" field)
  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "CONTACTADO":
        return (
          <Badge className="bg-sky-50 text-sky-700 border-sky-200/50 hover:bg-sky-50 font-semibold text-[10px] rounded-full px-2.5 py-0.5 border">
            CONTACTADO
          </Badge>
        );
      case "NO CONTACTADO":
        return (
          <Badge className="bg-rose-50 text-rose-700 border-rose-200/50 hover:bg-rose-50 font-semibold text-[10px] rounded-full px-2.5 py-0.5 border">
            NO CONTACTADO
          </Badge>
        );
      case "PREVENTA - CITA":
        return (
          <Badge className="bg-purple-50 text-purple-700 border-purple-200/50 hover:bg-purple-50 font-semibold text-[10px] rounded-full px-2.5 py-0.5 border">
            PREVENTA - CITA
          </Badge>
        );
      default:
        return (
          <Badge className="bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-50 font-semibold text-[10px] rounded-full px-2.5 py-0.5 border">
            {estado}
          </Badge>
        );
    }
  };

  // Color mapping inside Sheet details for subestado
  const getSubestadoBadge = (subestado: string) => {
    switch (subestado) {
      case "EFECTIVO":
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100 font-semibold">EFECTIVO</Badge>;
      case "NO EFECTIVO":
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-100 font-semibold">NO EFECTIVO</Badge>;
      case "NO CONTESTA":
        return <Badge className="bg-rose-100 text-rose-800 border-rose-200 hover:bg-rose-100 font-semibold">NO CONTESTA</Badge>;
      case "PENDIENDE DE PAGO":
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100 font-semibold">PENDIENTE DE PAGO</Badge>;
      case "MATRICULADO":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100 font-semibold">MATRICULADO</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-100 font-semibold">{subestado}</Badge>;
    }
  };

  // Color mapping inside Sheet details for detalle_motivo
  const getDetalleMotivoBadge = (motivo: string | null) => {
    if (!motivo) return <span className="text-slate-400 text-xs italic">Ninguno</span>;
    switch (motivo) {
      case "MUY INTERESADO":
        return <Badge className="bg-teal-100 text-teal-800 border-teal-200 hover:bg-teal-100 font-semibold">MUY INTERESADO</Badge>;
      case "VOLVER A LLAMAR":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100 font-semibold">VOLVER A LLAMAR</Badge>;
      case "NO INTERESADO POR PRECIOS":
        return <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-100 font-semibold">NO INTERESADO POR PRECIOS</Badge>;
      case "NO INTERESADO POR HORARIOS":
        return <Badge className="bg-pink-100 text-pink-800 border-pink-200 hover:bg-pink-100 font-semibold">NO INTERESADO POR HORARIOS</Badge>;
      case "CASILLA DE VOZ":
        return <Badge className="bg-slate-100 text-slate-850 border-slate-200 hover:bg-slate-100 font-semibold">CASILLA DE VOZ</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-100 font-semibold">{motivo}</Badge>;
    }
  };

  const handleCopyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone);
    toast.success(`Teléfono ${phone} copiado al portapapeles`);
  };

  const selectedSeller = useMemo(() => {
    return mockSellersData.find(s => s.id === activeSellerTab) || mockSellersData[0];
  }, [activeSellerTab]);

  return (
    <div className="space-y-6 fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Seguimiento de Equipo de Ventas</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitorea en tiempo real la gestión, tipificación y avance de prospectos asignados a cada asesor.
        </p>
      </div>

      {/* KPI Cards (SalesSupervisorProfile) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm border-border/60 hover:shadow-md transition-shadow duration-200 rounded-xl overflow-hidden bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Asesores Activos
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center">
              <Users size={16} className="text-sky-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3 / 10</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Asesores asignados a esta campaña
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/60 hover:shadow-md transition-shadow duration-200 rounded-xl overflow-hidden bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Conversión del Equipo
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <TrendingUp size={16} className="text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15.6%</div>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">
              +1.2% respecto a la semana anterior
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/60 hover:shadow-md transition-shadow duration-200 rounded-xl overflow-hidden bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Ventas Equipo
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <Layers size={16} className="text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">S/ 12,450</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Recaudado en matrículas y cuotas
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/60 hover:shadow-md transition-shadow duration-200 rounded-xl overflow-hidden bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Órdenes del Mes
            </CardTitle>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded bg-emerald-50 flex items-center justify-center" title="Completadas">
                <CheckCircle2 size={12} className="text-emerald-600" />
              </div>
              <div className="w-5 h-5 rounded bg-red-50 flex items-center justify-center" title="Canceladas">
                <XCircle size={12} className="text-red-650" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45 / 5</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Completadas vs. Canceladas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sheet-style Tabs and Table navigation */}
      <Card className="shadow-sm border-border/60 rounded-xl overflow-hidden bg-white">
        <Tabs value={activeSellerTab} onValueChange={setActiveSellerTab} className="w-full">
          <div className="bg-slate-50 border-b border-border p-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 px-3">
              Hojas de Asesores (Excel Style)
            </span>
            <TabsList className="bg-slate-200/50 p-1 rounded-lg border border-slate-300/40 w-fit">
              {mockSellersData.map(seller => (
                <TabsTrigger 
                  key={seller.id}
                  value={seller.id}
                  className="rounded-md py-1.5 px-4 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
                >
                  {seller.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {mockSellersData.map(seller => (
            <TabsContent key={seller.id} value={seller.id} className="outline-none m-0">
              <div className="p-4 border-b border-slate-100 bg-slate-50/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">{seller.name}</h3>
                  <p className="text-xs text-muted-foreground">{seller.email}</p>
                </div>
                <div className="flex gap-4 text-xs font-medium text-slate-600">
                  <span>Leads: <strong>{seller.metrics.totalLeads}</strong></span>
                  <span>Cierres: <strong>{seller.metrics.converted}</strong></span>
                  <span>Ventas: <strong className="text-emerald-600">S/ {seller.metrics.salesVal}</strong></span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50 border-b border-slate-250">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-xs font-bold text-slate-700 h-10 w-[140px]">
                        <span className="flex items-center gap-1.5"><Calendar size={13} /> FECHA / HORA</span>
                      </TableHead>
                      <TableHead className="text-xs font-bold text-slate-700 h-10 w-[220px]">
                        <span className="flex items-center gap-1.5"><BookOpen size={13} /> CURSO / PROGRAMA</span>
                      </TableHead>
                      <TableHead className="text-xs font-bold text-slate-700 h-10 w-[120px]">
                        <span className="flex items-center gap-1.5"><Phone size={13} /> CELULAR</span>
                      </TableHead>
                      <TableHead className="text-xs font-bold text-slate-700 h-10 w-[200px]">
                        <span className="flex items-center gap-1.5"><Users size={13} /> PROSPECTO</span>
                      </TableHead>
                      <TableHead className="text-xs font-bold text-slate-700 h-10 w-[140px]">
                        TIPIFICACIÓN
                      </TableHead>
                      <TableHead className="text-xs font-bold text-slate-700 h-10">
                        <span className="flex items-center gap-1.5"><MessageSquare size={13} /> ÚLTIMO COMENTARIO</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {seller.prospects.map((prospect, idx) => (
                      <TableRow 
                        key={prospect.id} 
                        onClick={() => setSelectedLead(prospect)}
                        className={`hover:bg-slate-100/80 cursor-pointer transition-colors border-b border-slate-100 ${
                          idx % 2 === 0 ? "bg-white" : "bg-slate-50/20"
                        }`}
                      >
                        <TableCell className="text-xs font-semibold text-slate-600">
                          {prospect.createdAt}
                        </TableCell>
                        <TableCell className="text-xs font-bold text-slate-800">
                          {prospect.course}
                        </TableCell>
                        <TableCell className="text-xs font-medium text-slate-700">
                          {prospect.phone}
                        </TableCell>
                        <TableCell className="text-xs font-bold text-slate-900">
                          {prospect.fullName}
                        </TableCell>
                        <TableCell>
                          {getEstadoBadge(prospect.estado)}
                        </TableCell>
                        <TableCell className="text-xs text-slate-600 max-w-xs truncate" title={prospect.notes}>
                          {prospect.notes}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </Card>

      {/* Interactive Master-Detail Drawer (Sheet) */}
      <Sheet open={!!selectedLead} onOpenChange={(open) => !open && setSelectedLead(null)}>
        <SheetContent className="w-[450px] sm:w-[540px] overflow-y-auto bg-white border-l border-slate-200 p-6 flex flex-col gap-6">
          {selectedLead && (
            <>
              {/* Header section */}
              <SheetHeader className="border-b border-slate-100 pb-4 text-left">
                <div className="flex flex-col gap-2">
                  <Badge className="bg-sky-50 text-sky-800 border-sky-200 w-fit rounded px-2 py-0.5 text-[10px] uppercase font-bold">
                    Detalle del Prospecto
                  </Badge>
                  <SheetTitle className="text-2xl font-bold text-slate-900 tracking-tight leading-snug">
                    {selectedLead.fullName}
                  </SheetTitle>
                  <div className="flex items-center gap-3 mt-1 bg-slate-50 p-2 rounded-lg border border-slate-100 w-fit">
                    <span className="text-sm font-semibold text-slate-700 tracking-wide">
                      {selectedLead.phone}
                    </span>
                    <button
                      onClick={() => handleCopyPhone(selectedLead.phone)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded transition-colors"
                      title="Copiar número"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
              </SheetHeader>

              {/* Matrix Section (3-level Classification) */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Matriz de Tipificación (3 Niveles)
                </h4>
                <div className="bg-slate-50/50 border border-slate-200/60 rounded-xl p-4 space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span className="text-xs font-semibold text-slate-500">1. Estado Principal</span>
                    {getEstadoBadge(selectedLead.estado)}
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span className="text-xs font-semibold text-slate-500">2. Subestado</span>
                    {getSubestadoBadge(selectedLead.subestado)}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-500">3. Detalle (Motivo)</span>
                    {getDetalleMotivoBadge(selectedLead.detalle_motivo)}
                  </div>
                </div>
              </div>

              {/* Comments Section */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Comentario de Gestión Comercial
                </h4>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 shadow-inner min-h-[120px]">
                  <p className="text-xs text-slate-700 leading-relaxed font-normal whitespace-pre-wrap">
                    {selectedLead.notes}
                  </p>
                </div>
              </div>

              {/* Academic and Enrollment details (Bottom Card) */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Datos Académicos y Campaña
                </h4>
                <Card className="border-border/60 shadow-sm rounded-xl bg-card overflow-hidden">
                  <CardContent className="p-4 space-y-3 text-xs">
                    <div className="flex items-center gap-2.5 text-slate-700">
                      <BookOpen size={14} className="text-muted-foreground shrink-0" />
                      <span className="font-semibold w-20">Programa:</span>
                      <span className="font-bold text-slate-900 truncate">{selectedLead.course}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-slate-700">
                      <Hash size={14} className="text-muted-foreground shrink-0" />
                      <span className="font-semibold w-20">DNI:</span>
                      <span className="font-medium text-slate-900">{selectedLead.dni}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-slate-700">
                      <Mail size={14} className="text-muted-foreground shrink-0" />
                      <span className="font-semibold w-20">Email:</span>
                      <span className="font-medium text-slate-900 truncate">{selectedLead.email}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-slate-700">
                      <Award size={14} className="text-muted-foreground shrink-0" />
                      <span className="font-semibold w-20">Campaña:</span>
                      <span className="font-medium text-slate-800">{selectedLead.campaign}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-slate-700">
                      <AlertCircle size={14} className="text-muted-foreground shrink-0" />
                      <span className="font-semibold w-20">Info Status:</span>
                      <Badge variant="outline" className={`font-semibold rounded ${
                        selectedLead.info_status === "Enviado" 
                          ? "bg-sky-50 text-sky-700 border-sky-100" 
                          : "bg-amber-50 text-amber-700 border-amber-100"
                      }`}>
                        {selectedLead.info_status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default SupervisorFollowUpView;
