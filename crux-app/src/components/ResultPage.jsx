import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

export const ResultPage = () => {

    const { data, isLoading, error } = useQuery({
      queryKey: ['dataKey'],
      queryFn: async () => {
        const response = await axios.get('/api/top_rates?year=2025&gym_id=3');
        return response.data;
      }
    });

    return (
        <div>
            <h1>Result Page</h1>
            <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
    )
}