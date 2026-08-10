import { useQuery } from '@tanstack/react-query';
import { getCourseEditionById } from '../services/courseService';
import { editionKeys } from '../queryKeys';

export const useEditionDetail = (editionId: string | undefined) => {
  return useQuery({
    queryKey: editionKeys.detail(editionId ?? ""),
    queryFn: () => getCourseEditionById(editionId!),
    enabled: !!editionId,
  });
};
