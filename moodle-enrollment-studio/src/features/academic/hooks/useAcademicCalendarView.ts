import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCourseEditions } from '../services/courseService';

export const useAcademicCalendarView = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['calendar-editions'],
    queryFn: getCourseEditions,
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [modalityFilter, setModalityFilter] = useState<string>("ALL");

  // La forma correcta de extraer los datos del JSON del backend
  const editions = (data && typeof data === 'object' && 'data' in data && Array.isArray(data.data))
    ? data.data.map((edition: any) => {
        const localStartDate = edition.start_date ? new Date(edition.start_date.replace('T00:00:00.000Z', 'T12:00:00').replace('Z', '')) : new Date();
        const year = localStartDate.getFullYear();

        return {
          id: edition.id,
          course_id: edition.course?.id,       // ✅ Correcto según tu estructura JSON actual
          course_name: edition.course?.name,   // ✅ Correcto según tu estructura JSON actual
          course_type: "General",              // Forzado a General temporalmente ya que el backend no envía type
          edition_name: `Edición ${edition.edition_number}`,
          edition_number: edition.edition_number,
          year: year,
          edition_code: edition.edition_code,  // El backend entrega 'edition_code'
          start_date: edition.start_date,
          end_date: edition.end_date,
          edition_status: edition.edition_status,
          modality: edition.modality,
          assigned_professors: edition.assigned_professors || [],
        };
      })
    : [];

  const filteredEditions = useMemo(() => {
    return editions.filter(ed => {
      // Prioridad de búsqueda: Nombre del curso o código de la edición de forma insensible a mayúsculas/minúsculas
      const matchesSearch = !search || 
        (ed.course_name && ed.course_name.toLowerCase().includes(search.toLowerCase())) || 
        (ed.edition_code && ed.edition_code.toLowerCase().includes(search.toLowerCase()));
        
      const matchesStatus = statusFilter.length === 0 || statusFilter.includes(ed.edition_status);
      const matchesModality = modalityFilter === "ALL" || ed.modality === modalityFilter;
      
      return matchesSearch && matchesStatus && matchesModality;
    });
  }, [editions, search, statusFilter, modalityFilter]);

  return { 
    editions: filteredEditions, 
    isLoading, 
    isError, 
    search, 
    setSearch, 
    statusFilter, 
    setStatusFilter, 
    modalityFilter, 
    setModalityFilter 
  };
};
