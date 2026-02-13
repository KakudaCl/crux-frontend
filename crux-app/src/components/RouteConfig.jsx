import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ResultPage } from './ResultPage';
import { ResultPageArea } from './ResultPageArea';
import { TrylogPage } from './TrylogPage';

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
  )
}