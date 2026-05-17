import { prisma } from "../../..";
import { CourseType } from "../../../../generated/prisma/enums";
import { courseCode } from "../../../helpers";


export async function fakeCourses() {
  const LP_CODE = courseCode("LP", 1); // "LP-00001" — adjust prefix per course
  const PB_CODE = courseCode("PB", 1);
 
  return await Promise.all([
    prisma.course.upsert({
      where: { code: LP_CODE },
      update: {},
      create: {
        type: CourseType.COURSE,
        name: "Lectura de Planos de Construcción Civil",
        description:
          "Aprende a leer e interpretar planos de Arquitectura, Estructuras, Instalaciones Eléctricas y Sanitarias.",
        classes_number: 16,
        image_url: "https://bf.edu.pe/assets/img/cursos/curso-lectura-planos.jpg",
        code: LP_CODE,
      },
    }),
 
    // Course 2: Análisis de Datos con Power BI
    prisma.course.upsert({
      where: { code: PB_CODE },
      update: {},
      create: {
        type: CourseType.COURSE,
        name: "Análisis de Datos con Power BI",
        description:
          "Transforma datos en dashboards interactivos usando Power BI desde cero hasta nivel avanzado.",
        classes_number: 12,
        image_url: null,
        code: PB_CODE,
      },
    }),
  ]);
}

export async function fakeStudyPlan(courseId: string) {
  const modules = [
    {
      title: "Módulo I: Planos de Arquitectura",
      order: 1,
      topics: [
        "La escala",
        "El escalímetro",
        "Lectura de planos de arquitectura: Plano de Planta",
        "Plano en Cortes",
        "Plano en Elevación",
        "Plano de Ubicación",
      ],
    },
    {
      title: "Módulo II: Planos de Estructuras 1",
      order: 2,
      topics: [
        "Importancia de la correcta ejecución de la estructura de una edificación",
        "Elementos estructurales de una edificación",
        "Tipos de aceros",
        "Tipos de resistencia de concreto",
        "Tipos de armaduras de acero",
        "Planos estructurales",
      ],
    },
    {
      title: "Módulo III: Planos de Estructuras 2",
      order: 3,
      topics: [
        "Planta de cimentación",
        "Zapatas",
        "Cimiento corrido y sobrecimiento",
        "Vigas de cimentación",
        "Cortes de cimentación",
        "Detalle de zapatas",
      ],
    },
    {
      title: "Módulo IV: Planos de Estructuras 3",
      order: 4,
      topics: [
        "Planta de cimentación con columnas",
        "Columnas",
        "Cuadro de columnas",
        "Detalle de columnas",
      ],
    },
    {
      title: "Módulo V: Planos de Estructuras 4",
      order: 5,
      topics: ["Planta de techo", "Losa aligerada", "Vigas", "Escaleras"],
    },
    {
      title: "Módulo VI: Instalaciones Sanitarias",
      order: 6,
      topics: [
        "¿Cómo llega el agua?",
        "¿Cómo se distribuye el agua? Simbología",
        "Red de agua, esquema de montantes para edificio con un sótano",
        "Detalle de cisterna, de tanque elevado, varios",
        "Red de desagüe",
        "Esquema de montantes para edificio con un sótano, ubicación de puntos",
      ],
    },
    {
      title: "Módulo VII: Instalaciones Eléctricas 1",
      order: 7,
      topics: [
        "¿Cómo se alimenta de energía eléctrica a una edificación?",
        "Simbología",
        "Planos de instalaciones eléctricas",
      ],
    },
    {
      title: "Módulo VIII: Instalaciones Eléctricas 2",
      order: 8,
      topics: [
        "Pozo tierra",
        "Detalle de Instalaciones eléctricas",
        "Examen Final",
      ],
    },
  ];
 
  return await prisma.studyPlan.create({
    data: {
      course_id: courseId,
      title: "Plan de Estudios — Lectura de Planos",
      description:
        "Diseñado para desarrollar habilidades prácticas desde la primera sesión.",
      order: 1,
      modules: {
        create: modules.map((m) => ({
          title: m.title,
          order: m.order,
          topics: {
            create: m.topics.map((t, i) => ({ title: t, order: i + 1 })),
          },
        })),
      },
    },
  });
}