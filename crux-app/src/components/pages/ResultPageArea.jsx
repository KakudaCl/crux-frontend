import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Dropdown } from 'react-bootstrap';
import { PageHeader } from '../parts/PageHeader';
import { chartOptions } from '../utilities/ChartOptions';
import { buildChartData } from '../utilities/ChartData';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import BlueHoldImage from '../../assets/images/blue_hold.png';
import EscalationImage from '../../assets/images/escalation_icon.png';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const ResultPageArea = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [gymId, setGymId] = useState(3);
  const [period, setPeriod] = useState(3);

  const { data, isLoading, error } = useQuery({
    queryKey: ['topRatesByArea', year, gymId, period],
    queryFn: async () => {
      const response = await axios.get(
        `/api/top_rates_area?year=${year}&gym_id=${gymId}&period=${period}`
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
        <div className="result-page__header-section">
          <h1 className="result-page__title">
            <img
              src={BlueHoldImage}
              style={{ width: '9%', marginRight: '20px' }}
              alt="エリア別完登率"
            />
            エリア別完登率
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
                {gymId === 1
                  ? 'Dボルダリングなんば'
                  : gymId === 2
                    ? 'クライミングバム大阪店'
                    : 'CRUX大阪'}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => setGymId(1)}>
                  Dボルダリングなんば
                </Dropdown.Item>
                <Dropdown.Item onClick={() => setGymId(2)}>
                  クライミングバム大阪店
                </Dropdown.Item>
                <Dropdown.Item onClick={() => setGymId(3)}>
                  CRUX大阪
                </Dropdown.Item>
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

            <Dropdown>
              <Dropdown.Toggle
                variant="primary"
                id="dropdown-period"
                style={{
                  fontFamily: "'Noto Sans JP', sans-serif",
                  fontWeight: 800,
                }}
              >
                {period === 1 ? '上半期' : period === 2 ? '下半期' : '年間'}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => setPeriod(1)}>
                  上半期
                </Dropdown.Item>
                <Dropdown.Item onClick={() => setPeriod(2)}>
                  下半期
                </Dropdown.Item>
                <Dropdown.Item onClick={() => setPeriod(3)}>年間</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>

        {resultInfo.map((gradeData) => {
          const chartData = buildChartData(gradeData, 'area_info', 'area_name');
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
                <Bar data={barData} options={chartOptions(actualData)} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
