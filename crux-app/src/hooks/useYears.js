import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export const useYears = () => {
  return useQuery({
    queryKey: ['years'],
    queryFn: async () => {
      const response = await axios.get('/api/trylog/year');
      return response.data;
    },
    staleTime: Infinity,
  });
};
