import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export const useGyms = () => {
  return useQuery({
    queryKey: ['gyms'],
    queryFn: async () => {
      const response = await axios.get('/api/gym/list');
      return response.data;
    },
    staleTime: Infinity,
  });
};
