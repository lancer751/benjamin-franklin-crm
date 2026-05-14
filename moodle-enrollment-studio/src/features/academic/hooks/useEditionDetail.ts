import { useQuery } from '@tanstack/react-query';
import { getCourseEditionById } from '../services/courseService';

export const useEditionDetail = (editionId: string | undefined) => {
  return useQuery({
    queryKey: ['edition', editionId],
    queryFn: () => getCourseEditionById(editionId!),
    enabled: !!editionId,
  });
};
