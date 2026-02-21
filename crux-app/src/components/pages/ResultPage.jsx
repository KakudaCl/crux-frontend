import { useState } from 'react';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Dropdown } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';

import EscalationImage from '../../assets/images/escalation_icon.png';
import GreenHoldImage from '../../assets/images/green_hold.png';
import { useGyms } from '../../hooks/useGyms';
import { PageHeader } from '../parts/PageHeader';
import { buildChartData } from '../utilities/ChartData';
import { chartOptions } from '../utilities/ChartOptions';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const ResultPage = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [gymId, setGymId] = useState(3);

  const { data: gymsData } = useGyms();
  const gyms = gymsData?.gyms_info ?? [];
  const selectedGymName = gyms.find((g) => g.gym_id === gymId)?.gym_name ?? '読み込み中...';

  const { data, isLoading, error } = useQuery({
    queryKey: ['topRates', year, gymId],
    queryFn: async () => {
      const response = await axios.get(
        `/api/top_rate/month?year=${year}&gym_id=${gymId}`
      );
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="result-page">
        <div className="result-page__container">
          <p>読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="result-page">
        <div className="result-page__container">
          <p>エラー: {error.message}</p>
        </div>
      </div>
    );
  }

  const resultInfo = data?.result_info ?? [];

  return (
    <div className="result-page">
      {/* ヘッダー */}
      <PageHeader />

      <div className="result-page__container">
        {/* タイトルとドロップダウンを横並びに */}
        <div className="result-page__header-section">
          <h1 className="result-page__title">
            <img
              src={GreenHoldImage}
              style={{ width: '8%', marginRight: '14px' }}
              alt="マンスリー別完登率"
            />
            マンスリー別完登率
            <img
              src={EscalationImage}
              style={{ width: '40px', marginLeft: '10px', marginBottom: '6px' }}
            />
          </h1>
          <div className="result-page__controls">
            <Dropdown>
              <Dropdown.Toggle
                variant="primary"
                id="dropdown-gym"
                style={{
                  fontFamily: "'Noto Sans JP', sans-serif",
                  fontWeight: 800,
                }}
              >
                {selectedGymName}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {gyms.map((gym) => (
                  <Dropdown.Item key={gym.gym_id} onClick={() => setGymId(gym.gym_id)}>
                    {gym.gym_name}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>

            <Dropdown>
              <Dropdown.Toggle
                variant="primary"
                id="dropdown-year"
                style={{
                  fontFamily: "'Noto Sans JP', sans-serif",
                  fontWeight: 800,
                }}
              >
                {year}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => setYear(2025)}>
                  2025
                </Dropdown.Item>
                <Dropdown.Item onClick={() => setYear(2026)}>
                  2026
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>

        {/* マンスリー別チャート */}
        {resultInfo.map((gradeData) => {
          const chartData = buildChartData(gradeData, 'monthly_info', 'month');
          const actualData = chartData._actualData;
          const { _actualData, ...barData } = chartData;

          return (
            <div key={gradeData.grade} className="result-page__chart-container">
              <div
                className="result-page__chart-title"
                style={{
                  color: '#' + gradeData.grade_color || 'rgb(128, 128, 128)',
                }}
              >
                {gradeData.grade}
              </div>
              <div className="result-page__chart-wrapper">
                <Bar
                  data={barData}
                  options={chartOptions(actualData, 'Month')}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
