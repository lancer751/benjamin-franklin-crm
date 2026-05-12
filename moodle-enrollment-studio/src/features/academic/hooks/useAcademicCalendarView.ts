import { useQuery } from '@tanstack/react-query';
import { getCourseEditions } from '../services/courseService';

export const useAcademicCalendarView = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['calendar-editions'],
    queryFn: getCourseEditions,
  });

  const editions = data?.data?.map((edition: any) => {
    // Extraer año de la fecha de inicio, aplicando corrección para evitar desfase de zona horaria
    const localStartDate = edition.start_date ? new Date(edition.start_date.replace('T00:00:00.000Z', 'T12:00:00').replace('Z', '')) : new Date();
    const year = localStartDate.getFullYear();

    return {
      id: edition.id,
      course_id: edition.course?.id,
      course_name: edition.course?.name,
      course_type: edition.course?.type || "General",
      edition_name: `Edición ${edition.edition_number}`,
      edition_number: edition.edition_number,
      year: year,
      edition_code: edition.edition_code || edition.code,
      start_date: edition.start_date,
      end_date: edition.end_date,
      edition_status: edition.edition_status,
      teacher_fullname: edition.teacher_fullname,
    };
  }) || [];

  return { editions, isLoading, isError };
};
