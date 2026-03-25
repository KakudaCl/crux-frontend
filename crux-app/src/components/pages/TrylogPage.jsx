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
import { Link } from 'react-router-dom';

import EscalationImage from '../../assets/images/escalation_icon.png';
import YellowHoldImage from '../../assets/images/yellow_hold.png';
import { useGyms } from '../../hooks/useGyms';
import { PageHeader } from '../parts/PageHeader';
import { getResultColor } from '../utilities/ResultColor';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const TrylogPage = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [gymId, setGymId] = useState(3);
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  const { data: gymsData } = useGyms();
  const gyms = gymsData?.gyms_info ?? [];
  const selectedGymName =
    gyms.find((g) => g.gym_id === gymId)?.gym_name ?? '読み込み中...';

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['topRates', year, gymId, month],
    queryFn: async () => {
      const response = await axios.get(
        `/api/trylog/list?year=${year}&month=${month}&gym_id=${gymId}`
      );
      return response.data;
    },
  });

  // season_best: year・gym_id・month に依存
  const { data: bestProbSeasonBestData } = useQuery({
    queryKey: ['bestProbSeasonBest', year, gymId, month],
    queryFn: async () => {
      const response = await axios.get(
        `/api/trylog/best/prob?year=${year}&gym_id=${gymId}&month=${month}`
      );
      return response.data?.season_best ?? null;
    },
  });

  // personal_best: gym_id のみに依存（year・month は使用しない）
  const { data: bestProbPersonalBestData } = useQuery({
    queryKey: ['bestProbPersonalBest', year, gymId, month],
    queryFn: async () => {
      const response = await axios.get(
        `/api/trylog/best/prob?year=${year}&gym_id=${gymId}&month=${month}`
      );
      return response.data?.personal_best ?? null;
    },
  });

  // season_best: year・gym_id・month に依存
  const { data: bestCountSeasonBestData } = useQuery({
    queryKey: ['bestCountSeasonBest', year, gymId, month],
    queryFn: async () => {
      const response = await axios.get(
        `/api/trylog/best/count?year=${year}&gym_id=${gymId}&month=${month}`
      );
      return response.data?.season_best ?? null;
    },
  });

  // personal_best: gym_id のみに依存（year・month は使用しない）
  const { data: bestCountPersonalBestData } = useQuery({
    queryKey: ['bestCountPersonalBest', year, gymId, month],
    queryFn: async () => {
      const response = await axios.get(
        `/api/trylog/best/count?year=${year}&gym_id=${gymId}&month=${month}`
      );
      return response.data?.personal_best ?? null;
    },
  });

  if (isLoading || isFetching) {
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

  const trylogInfo = data?.all_logs ?? [];

  const bestProbSeasonBest = bestProbSeasonBestData ?? null;
  const bestProbPersonalBest = bestProbPersonalBestData ?? null;
  const bestCountSeasonBest = bestCountSeasonBestData ?? null;
  const bestCountPersonalBest = bestCountPersonalBestData ?? null;

  const bestCardStyle = {
    background: 'white',
    borderRadius: 12,
    padding: '24px 16px',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    height: '100%',
  };

  const bestCardTitleStyle = {
    fontFamily: "'Stick No Bills', sans-serif",
    fontWeight: 800,
    fontSize: 26,
    marginBottom: 16,
  };

  const bestCardMainStyle = (color) => ({
    fontFamily: "'Stick No Bills', sans-serif",
    fontWeight: 800,
    fontSize: 48,
    color: color ? `#${color}` : '#888',
  });

  const bestCardDateStyle = {
    fontFamily: "'Stick No Bills', sans-serif",
    fontWeight: 800,
    fontSize: 26,
    marginTop: 8,
  };

  return (
    <div className="result-page">
      {/* ヘッダー */}
      <PageHeader />

      <div className="result-page__container">
        {/* タイトルとドロップダウンを横並びに */}
        <div className="result-page__header-section">
          <h1 className="result-page__title">
            <img
              src={YellowHoldImage}
              style={{ width: '45px', marginRight: '10px' }}
              alt="トライログ"
            />
            トライログ
            <img
              src={EscalationImage}
              style={{ width: '40px', marginLeft: '10px', marginBottom: '6px' }}
            />
          </h1>
          <div className="result-page__controls">
            <Link
              to="/register/trylog"
              style={{
                display: 'inline-block',
                padding: '8px 16px',
                fontSize: 14,
                fontFamily: "'Noto Sans JP', sans-serif",
                fontWeight: 800,
                color: 'white',
                backgroundColor: '#4caf50',
                borderRadius: 6,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              ＋ トライログ登録
            </Link>

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
                  <Dropdown.Item
                    key={gym.gym_id}
                    onClick={() => setGymId(gym.gym_id)}
                  >
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

            <Dropdown>
              <Dropdown.Toggle
                variant="primary"
                id="dropdown-year"
                style={{
                  fontFamily: "'Noto Sans JP', sans-serif",
                  fontWeight: 800,
                }}
              >
                {month}月
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <Dropdown.Item key={month} onClick={() => setMonth(month)}>
                    {month}月
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>

        {trylogInfo.map((trylogData) => {
          return (
            <div key={trylogData.id} className="result-page__chart-container">
              <div className="result-page__chart-title">
                {trylogData.try_date}
              </div>
              <table class="table">
                <thead>
                  <tr>
                    <th scope="col" style={{ width: '15%' }}>
                      #
                    </th>
                    <th scope="col" style={{ width: '15%' }}>
                      Result
                    </th>
                    <th scope="col" style={{ width: '20%' }}>
                      Area
                    </th>
                    <th scope="col" style={{ width: '10%' }}>
                      Day
                    </th>
                    <th scope="col" style={{ width: '40%' }}>
                      Remarks
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {trylogData.try_log.map((log) => (
                    <tr key={log.prob_no}>
                      <td
                        scope="row"
                        style={{
                          fontFamily: "'Stick No Bills', sans-serif",
                          fontWeight: 800,
                          fontSize: 26,
                          verticalAlign: 'middle',
                          color: `#${log.grade_color}`,
                        }}
                      >
                        {log.prob_no}
                      </td>
                      <td
                        style={{
                          fontFamily: "'Stick No Bills', sans-serif",
                          fontWeight: 800,
                          fontSize: 26,
                          verticalAlign: 'middle',
                          color: getResultColor(log.result),
                        }}
                      >
                        {log.result}
                      </td>
                      <td
                        style={{
                          fontFamily: "'Noto Sans JP', sans-serif",
                          fontWeight: 800,
                          fontSize: 16,
                          verticalAlign: 'middle',
                        }}
                      >
                        {log.area}
                      </td>
                      <td
                        style={{
                          fontFamily: "'Noto Sans JP', sans-serif",
                          fontWeight: 800,
                          fontSize: 16,
                          verticalAlign: 'middle',
                        }}
                      >
                        {log.day_count}
                      </td>
                      <td
                        style={{
                          fontFamily: "'Noto Sans JP', sans-serif",
                          fontWeight: 800,
                          fontSize: 16,
                          verticalAlign: 'middle',
                        }}
                      >
                        {log.remarks}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}

        {/* ベスト記録カード */}
        <div className="row g-3">
          {/* Prob Season Best / Prob Personal Best：両方nullの場合は非表示 */}
          {(bestProbSeasonBest || bestProbPersonalBest) && (
            <>
              {/* Prob Season Best */}
              <div className="col-6">
                <div style={bestCardStyle}>
                  <div style={bestCardTitleStyle}>PROB SEASON BEST {year}</div>
                  {bestProbSeasonBest ? (
                    <>
                      <div
                        style={bestCardMainStyle(
                          bestProbSeasonBest.grade_color
                        )}
                      >
                        No.{bestProbSeasonBest.prob_no}&nbsp;&nbsp;
                        {bestProbSeasonBest.grade}
                      </div>
                      <div style={bestCardDateStyle}>
                        {bestProbSeasonBest.record_date}
                      </div>
                    </>
                  ) : (
                    <div
                      style={{
                        fontFamily: "'Stick No Bills', sans-serif",
                        fontWeight: 800,
                        fontSize: 26,
                        color: '#888',
                      }}
                    >
                      NO DATA
                    </div>
                  )}
                </div>
              </div>

              {/* Prob Personal Best */}
              <div className="col-6">
                <div style={bestCardStyle}>
                  <div style={bestCardTitleStyle}>PROB PERSONAL BEST</div>
                  {bestProbPersonalBest ? (
                    <>
                      <div
                        style={bestCardMainStyle(
                          bestProbPersonalBest.grade_color
                        )}
                      >
                        No.{bestProbPersonalBest.prob_no}&nbsp;&nbsp;
                        {bestProbPersonalBest.grade}
                      </div>
                      <div style={bestCardDateStyle}>
                        {bestProbPersonalBest.record_date}
                      </div>
                    </>
                  ) : (
                    <div
                      style={{
                        fontFamily: "'Stick No Bills', sans-serif",
                        fontWeight: 800,
                        fontSize: 26,
                        color: '#888',
                      }}
                    >
                      NO DATA
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Count Season Best */}
          <div className="col-6">
            <div style={bestCardStyle}>
              <div style={bestCardTitleStyle}>COUNT SEASON BEST {year}</div>
              {bestCountSeasonBest ? (
                <>
                  <div
                    style={bestCardMainStyle(bestCountSeasonBest.grade_color)}
                  >
                    {bestCountSeasonBest.grade}&nbsp;&nbsp;
                    {'★'.repeat(bestCountSeasonBest.top_count)}
                  </div>
                  <div style={bestCardDateStyle}>
                    {bestCountSeasonBest.record_date}
                  </div>
                </>
              ) : (
                <div
                  style={{
                    fontFamily: "'Stick No Bills', sans-serif",
                    fontWeight: 800,
                    fontSize: 26,
                    color: '#888',
                  }}
                >
                  NO DATA
                </div>
              )}
            </div>
          </div>

          {/* Count Personal Best */}
          <div className="col-6">
            <div style={bestCardStyle}>
              <div style={bestCardTitleStyle}>COUNT PERSONAL BEST</div>
              {bestCountPersonalBest ? (
                <>
                  <div
                    style={bestCardMainStyle(bestCountPersonalBest.grade_color)}
                  >
                    {bestCountPersonalBest.grade}&nbsp;&nbsp;
                    {'★'.repeat(bestCountPersonalBest.top_count)}
                  </div>
                  <div style={bestCardDateStyle}>
                    {bestCountPersonalBest.record_date}
                  </div>
                </>
              ) : (
                <div
                  style={{
                    fontFamily: "'Stick No Bills', sans-serif",
                    fontWeight: 800,
                    fontSize: 26,
                    color: '#888',
                  }}
                >
                  NO DATA
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
