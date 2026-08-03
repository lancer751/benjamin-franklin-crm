export const getCertificationDefaultText = (courseName: string): string => {
  if (!courseName) return "";
  return `Al culminar satisfactoriamente y aprobar el programa, el alumno obtendrá: Certificado de ${courseName}. La certificación valida tus conocimientos de manera oficial y respalda tu perfil profesional ante el mercado laboral nacional e internacional.`;
};

export interface InstitutionalFAQ {
  question: string;
  answer: string;
}

export const INSTITUTIONAL_FAQS: InstitutionalFAQ[] = [
  {
    question: "Método de dictado virtual en vivo",
    answer: "Nuestra metodología incluye sesiones 100% online en tiempo real a través de nuestra aula virtual. Esto permite una interacción directa y continua con los docentes, además de acceso posterior a las grabaciones de todas las clases.",
  },
  {
    question: "Aval de la UNI/DIRSODES UNI",
    answer: "Este programa cuenta con el respaldo y certificación académica a través de convenios de colaboración institucional con DIRSODES UNI, asegurando el más alto estándar de excelencia universitaria.",
  },
  {
    question: "Formato doble digital/físico",
    answer: "Al egresar satisfactoriamente, el alumno recibe su certificación formal en formato doble: una versión física impresa en papel de seguridad especial de alta calidad, y una credencial digital verificable con firma electrónica y código QR.",
  },
  {
    question: "Conocimiento previo no indispensable",
    answer: "No es necesario tener experiencia previa en la materia. El plan de estudios está estructurado pedagógicamente desde un nivel inicial (cero) hasta alcanzar competencias avanzadas en el desarrollo del curso.",
  },
];
