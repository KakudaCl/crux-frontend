import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export const useGyms = () => {
  return useQuery({
    queryKey: ['gyms'],
    queryFn: async () => {
      const response = await axios.get('/api/gyms_name');
      return response.data;
    },
    staleTime: Infinity,
  });
};
