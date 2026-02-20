import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ResultPage } from '../components/pages/ResultPage';
import { ResultPageArea } from '../components/pages/ResultPageArea';
import { TrylogPage } from '../components/pages/TrylogPage';

export const RouteConfig = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ResultPage />} />
        <Route path="/month" element={<ResultPage />} />
        <Route path="/area" element={<ResultPageArea />} />
        <Route path="/trylog" element={<TrylogPage />} />
      </Routes>
    </BrowserRouter>
  );
};
