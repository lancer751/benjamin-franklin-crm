import { AttendanceMode, prisma, SalesStatus } from "../../..";
import type { fakeEditions } from "./editions";

export async function fakeCategories() {
  return await Promise.all([
    prisma.category.upsert({
      where: { name: "Construcción e Ingeniería" },
      update: {},
      create: { name: "Construcción e Ingeniería" },
    }),
    prisma.category.upsert({
      where: { name: "Tecnología y Data" },
      update: {},
      create: { name: "Tecnología y Data" },
    }),
  ]);
}

export async function fakeBenefits() {
  const defs = [
    { description: "Materiales académicos descargables" },
    { description: "Docentes expertos" },
    { description: "Ofertas laborales" },
    { description: "Soporte 24/7" },
    { description: "Certificado con código QR digital o físico" },
  ];
  return await Promise.all(
    defs.map((b) =>
      prisma.benefit.create({
        data: b,
      }),
    ),
  );
}

export async function fakeProducts(
  editions: Awaited<ReturnType<typeof fakeEditions>>,
  categories: Awaited<ReturnType<typeof fakeCategories>>,
  benefits: Awaited<ReturnType<typeof fakeBenefits>>,
) {
  const [lpVirtual, lpHibrid, pbVirtual] = editions;
  const [catConstruction, catTech] = categories;

  // ── Product 1: LP Virtual edition ─────────────────────────────────────────
  const lpProductVirtual = await prisma.product.create({
    data: {
      name: "Curso de Lectura de Planos — Virtual",
      slug: "lectura-planos-virtual",
      description:
        "Domina el lenguaje de la ingeniería. Aprende a leer planos de construcción e interpretar correctamente proyectos de Arquitectura, Estructuras, Instalaciones Eléctricas y Sanitarias. Modalidad Virtual (Nacional).",
      short_description:
        "Aprende a leer planos de construcción Civil en modalidad virtual.",
      image_url: "https://bf.edu.pe/assets/img/cursos/curso-lectura-planos.jpg",
      edition_id: lpVirtual.id,
      category_id: catConstruction.id,
      installments_max_number: 4,
      installments_min_number: 2,
      sales_status: SalesStatus.ON_SALE,
      // Prices
      prices: {
        create: [
          {
            attendance_mode: AttendanceMode.VIRTUAL,
            cash_price: 340,
            installment_price: 360,
            enrollment_fee: 100,
          },
        ],
      },
      // Benefits (connect all)
      relatedBenefits: {
        create: benefits.map((b) => ({ benefit_id: b.id })),
      },
      // FAQs
      frequentQuestions: {
        create: [
          {
            order: 1,
            question: "¿Cómo se dictan las clases?",
            answer:
              "Tienes total flexibilidad: puedes asistir a los talleres presenciales en nuestra sede de Lima para la práctica real. Si por tiempo o distancia no puedes asistir, tienes acceso completo al aula virtual 24/7 con las mismas clases y materiales para aprender de forma remota.",
          },
          {
            order: 2,
            question: "¿Cómo es la certificación?",
            answer:
              "Al finalizar, recibirás un certificado oficial emitido por la Corporación Educativa Benjamin Franklin. Se entrega en formato Digital (con QR) y Físico (disponible para recojo en nuestras oficinas).",
          },
          {
            order: 3,
            question: "¿Necesito conocimientos previos?",
            answer:
              "No es indispensable. Nuestro plan de estudios está estructurado para llevarte desde los fundamentos básicos hasta el nivel experto.",
          },
          {
            order: 4,
            question: "¿Cómo recibo mi certificado?",
            answer:
              "Todos nuestros certificados se entregan en doble formato: Digital (con código QR de validación) y Físico (puedes acercarte a nuestras oficinas para recogerlo).",
          },
        ],
      },
      // Certification
      relatedCertifications: {
        create: [
          {
            title: "Certificado del Curso de Lectura de Planos",
            description:
              "Certificado válido para registrarte en el RETCC (Registro Nacional de Trabajadores de Construcción Civil) y acceder a obras del sector público y privado.",
            image_url:
              "https://bf.edu.pe/assets/img/certificados/benjamin/certificado-lectura-planos.jpg",
            has_digital: true,
            has_physical: true,
            issuing_authority: "Corporación Educativa Benjamin Franklin",
            registry_validity: "Válido para el RETCC y Ministerio de Trabajo",
          },
        ],
      },
    },
  });

  // ── Product 2: LP Hybrid edition (adds PRESENCIAL price) ──────────────────
  const lpProductHibrid = await prisma.product.create({
    data: {
      name: "Curso de Lectura de Planos — Presencial / Virtual",
      slug: "lectura-planos-hibrido",
      description:
        "La misma formación en modalidad Híbrida: asiste presencialmente en Lima o conéctate de forma remota.",
      short_description:
        "Lectura de Planos con opción presencial en Lima o virtual a nivel nacional.",
      image_url: "https://bf.edu.pe/assets/img/cursos/curso-lectura-planos.jpg",
      edition_id: lpHibrid.id,
      category_id: catConstruction.id,
      installments_max_number: 4,
      installments_min_number: 2,
      sales_status: SalesStatus.PUBLISHED,
      prices: {
        create: [
          {
            attendance_mode: AttendanceMode.VIRTUAL,
            cash_price: 340,
            installment_price: 360,
            enrollment_fee: 100,
          },
          {
            attendance_mode: AttendanceMode.PRESENCIAL,
            cash_price: 440,
            installment_price: 460,
            enrollment_fee: 150,
          },
        ],
      },
      relatedBenefits: {
        create: benefits.map((b) => ({ benefit_id: b.id })),
      },
      frequentQuestions: {
        create: [
          {
            order: 1,
            question: "¿Cuál es la diferencia entre virtual y presencial?",
            answer:
              "La modalidad presencial incluye acceso a nuestros laboratorios físicos en Lima (Av. Aviación 2484, San Borja). La virtual te da acceso 24/7 al aula en línea con las mismas clases grabadas.",
          },
          {
            order: 2,
            question: "¿Puedo cambiar de modalidad durante el curso?",
            answer:
              "Sí, puedes coordinar el cambio con nuestro equipo de soporte con al menos una semana de anticipación, sujeto a disponibilidad de cupos presenciales.",
          },
        ],
      },
      relatedCertifications: {
        create: [
          {
            title: "Certificado del Curso de Lectura de Planos",
            description:
              "Certificado válido para el RETCC independientemente de la modalidad elegida.",
            image_url:
              "https://bf.edu.pe/assets/img/certificados/benjamin/certificado-lectura-planos.jpg",
            has_digital: true,
            has_physical: true,
            issuing_authority: "Corporación Educativa Benjamin Franklin",
            registry_validity: "Válido para el RETCC y Ministerio de Trabajo",
          },
        ],
      },
    },
  });

  // ── Product 3: Power BI ────────────────────────────────────────────────────
  const pbProduct = await prisma.product.create({
    data: {
      name: "Curso de Análisis de Datos con Power BI",
      slug: "power-bi-analisis-datos",
      description:
        "Aprende a conectar fuentes de datos, modelar y crear dashboards interactivos con Microsoft Power BI.",
      short_description: "De cero a dashboards profesionales con Power BI.",
      image_url: null,
      edition_id: pbVirtual.id,
      category_id: catTech.id,
      installments_max_number: 3,
      installments_min_number: 2,
      sales_status: SalesStatus.ON_SALE,
      prices: {
        create: [
          {
            attendance_mode: AttendanceMode.VIRTUAL,
            cash_price: 320,
            installment_price: 340,
            enrollment_fee: 100,
          },
        ],
      },
      relatedBenefits: {
        create: benefits.slice(0, 4).map((b) => ({ benefit_id: b.id })),
      },
      frequentQuestions: {
        create: [
          {
            order: 1,
            question: "¿Necesito conocimientos previos de Excel?",
            answer:
              "Es recomendable tener nociones básicas de Excel, pero no es obligatorio. El curso empieza desde los fundamentos de análisis de datos.",
          },
          {
            order: 2,
            question: "¿Qué versión de Power BI se utiliza?",
            answer:
              "Se trabaja con Power BI Desktop (gratuito) y se abordan las funciones de Power BI Service para publicación en la nube.",
          },
        ],
      },
      relatedCertifications: {
        create: [
          {
            title: "Certificado de Análisis de Datos con Power BI",
            description:
              "Certificado emitido por la Corporación Educativa Benjamin Franklin al aprobar satisfactoriamente el curso.",
            image_url: null,
            has_digital: true,
            has_physical: true,
            issuing_authority: "Corporación Educativa Benjamin Franklin",
            registry_validity: null,
          },
        ],
      },
    },
  });

  return [lpProductVirtual, lpProductHibrid, pbProduct];
}
