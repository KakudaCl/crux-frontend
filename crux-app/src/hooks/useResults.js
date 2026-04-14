import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export const useResults = () => {
  return useQuery({
    queryKey: ['results'],
    queryFn: async () => {
      const response = await axios.get('/api/result/list');
      return response.data;
    },
    staleTime: Infinity,
  });
};
