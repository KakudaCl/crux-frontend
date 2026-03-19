import { useState } from 'react';

import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

import EscalationImage from '../../assets/images/escalation_icon.png';
import YellowHoldImage from '../../assets/images/yellow_hold.png';
import { useGyms } from '../../hooks/useGyms';
import { PageHeader } from '../parts/PageHeader';

const today = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const createEmptyRow = () => ({
  prob_no: 1,
  grade_id: null,
  result_id: null,
  area_id: null,
  day_count: 1,
  remarks: '',
});

export const RegisterTrylogPage = () => {
  const [gymId, setGymId] = useState(1);
  const [tryDate, setTryDate] = useState(today());
  const [rows, setRows] = useState([createEmptyRow()]);

  const { data: gymsData } = useGyms();
  const gyms = gymsData?.gyms_info ?? [];

  const { data: gradesData } = useQuery({
    queryKey: ['grades', gymId],
    queryFn: async () => {
      const res = await axios.get(`/api/grade/list?gym_id=${gymId}`);
      return res.data?.grades_info ?? [];
    },
    enabled: !!gymId,
  });
  const grades = gradesData ?? [];

  const { data: resultsData } = useQuery({
    queryKey: ['results'],
    queryFn: async () => {
      const res = await axios.get('/api/result/list');
      return res.data?.results_info ?? [];
    },
  });
  const results = resultsData ?? [];

  const { data: areasData } = useQuery({
    queryKey: ['areas', gymId],
    queryFn: async () => {
      const res = await axios.get(`/api/area/list?gym_id=${gymId}`);
      return res.data?.areas_info ?? [];
    },
    enabled: !!gymId,
  });
  const areas = areasData ?? [];

  const { mutate: registerTrylog, isPending } = useMutation({
    mutationFn: async (payload) => {
      const res = await axios.post('/api/trylog/register', payload);
      return res.data;
    },
    onSuccess: () => {
      alert('登録しました');
      setRows([createEmptyRow()]);
    },
    onError: (err) => {
      alert(`登録に失敗しました: ${err.message}`);
    },
  });

  const handleGymChange = (newGymId) => {
    setGymId(Number(newGymId));
  };

  const handleRowChange = (index, field, value) => {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

  const handleAddRow = () => {
    setRows((prev) => [...prev, createEmptyRow()]);
  };

  const handleDeleteRow = (index) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    registerTrylog({
      gym_id: gymId,
      try_date: tryDate,
      trylog_list: rows.map((row) => ({
        prob_no: row.prob_no ? Number(row.prob_no) : null,
        grade_id: Number(row.grade_id ?? grades[0]?.grade_id ?? null),
        result_id: Number(row.result_id ?? results[0]?.result_id ?? null),
        area_id: Number(row.area_id ?? areas[0]?.area_id ?? null),
        day_count: row.day_count ? Number(row.day_count) : null,
        remarks: row.remarks || null,
      })),
    });
  };

  return (
    <div className="result-page">
      <PageHeader />

      <div className="result-page__container">
        {/* タイトル */}
        <div className="result-page__header-section">
          <h1 className="result-page__title">
            <img
              src={YellowHoldImage}
              style={{ width: '8%', marginRight: '10px' }}
              alt="トライログ"
            />
            トライログ登録
            <img
              src={EscalationImage}
              style={{ width: '40px', marginLeft: '10px', marginBottom: '6px' }}
              alt=""
            />
          </h1>
        </div>

        {/* 共通項目 */}
        <div className="result-page__chart-container">
          <div
            className="result-page__chart-title"
            style={{ fontSize: 28, marginBottom: 24 }}
          >
            共通項目
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
              maxWidth: 600,
              margin: '0 auto',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <label
                style={{
                  minWidth: 60,
                  textAlign: 'right',
                  fontWeight: 600,
                  color: '#333',
                }}
              >
                ジム
              </label>
              <select
                value={gymId}
                onChange={(e) => handleGymChange(e.target.value)}
                style={selectStyle}
              >
                {gyms.map((gym) => (
                  <option key={gym.gym_id} value={gym.gym_id}>
                    {gym.gym_name}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <label
                style={{
                  minWidth: 60,
                  textAlign: 'right',
                  fontWeight: 600,
                  color: '#333',
                }}
              >
                日付
              </label>
              <input
                type="date"
                value={tryDate}
                onChange={(e) => setTryDate(e.target.value)}
                style={{ ...selectStyle, paddingRight: 8 }}
              />
            </div>
          </div>
        </div>

        {/* トライ項目 */}
        <div className="result-page__chart-container">
          <div
            className="result-page__chart-title"
            style={{ fontSize: 28, marginBottom: 24 }}
          >
            トライ項目
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                minWidth: 700,
              }}
            >
              <thead>
                <tr>
                  {['No', 'Grade', 'Result', 'Area', 'Day', 'Remarks', ''].map(
                    (h) => (
                      <th
                        key={h}
                        style={{
                          padding: '8px 12px',
                          textAlign: 'center',
                          fontWeight: 700,
                          color: '#333',
                          fontSize: 14,
                          borderBottom: '2px solid #e0e0e0',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={index}>
                    {/* No */}
                    <td style={tdStyle}>
                      <select
                        value={row.prob_no}
                        onChange={(e) =>
                          handleRowChange(index, 'prob_no', e.target.value)
                        }
                        style={cellSelectStyle}
                      >
                        {Array.from({ length: 50 }, (_, i) => i + 1).map(
                          (n) => (
                            <option key={n} value={n}>
                              {n}
                            </option>
                          )
                        )}
                      </select>
                    </td>
                    {/* Grade */}
                    <td style={tdStyle}>
                      <select
                        value={row.grade_id ?? grades[0]?.grade_id ?? ''}
                        onChange={(e) =>
                          handleRowChange(index, 'grade_id', e.target.value)
                        }
                        style={cellSelectStyle}
                      >
                        {grades.map((g) => (
                          <option key={g.grade_id} value={g.grade_id}>
                            {g.grade_name}
                          </option>
                        ))}
                      </select>
                    </td>
                    {/* Result */}
                    <td style={tdStyle}>
                      <select
                        value={row.result_id ?? results[0]?.result_id ?? ''}
                        onChange={(e) =>
                          handleRowChange(index, 'result_id', e.target.value)
                        }
                        style={cellSelectStyle}
                      >
                        {results.map((r) => (
                          <option key={r.result_id} value={r.result_id}>
                            {r.result_name}
                          </option>
                        ))}
                      </select>
                    </td>
                    {/* Area */}
                    <td style={tdStyle}>
                      <select
                        value={row.area_id ?? areas[0]?.area_id ?? ''}
                        onChange={(e) =>
                          handleRowChange(index, 'area_id', e.target.value)
                        }
                        style={cellSelectStyle}
                      >
                        {areas.map((a) => (
                          <option key={a.area_id} value={a.area_id}>
                            {a.area_name}
                          </option>
                        ))}
                      </select>
                    </td>
                    {/* Day */}
                    <td style={tdStyle}>
                      <select
                        value={row.day_count}
                        onChange={(e) =>
                          handleRowChange(index, 'day_count', e.target.value)
                        }
                        style={cellSelectStyle}
                      >
                        {[1, 2, 3, 4, 5].map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </td>
                    {/* Remarks */}
                    <td style={tdStyle}>
                      <input
                        type="text"
                        value={row.remarks}
                        maxLength={30}
                        onChange={(e) =>
                          handleRowChange(index, 'remarks', e.target.value)
                        }
                        placeholder="備考"
                        style={remarksInputStyle}
                      />
                    </td>
                    {/* 削除ボタン (最初の行には表示しない) */}
                    <td style={{ ...tdStyle, width: 40 }}>
                      {index > 0 && (
                        <button
                          onClick={() => handleDeleteRow(index)}
                          style={deleteButtonStyle}
                          aria-label="行を削除"
                        >
                          ✕
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 行追加ボタン */}
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <button onClick={handleAddRow} style={addRowButtonStyle}>
              行を追加
            </button>
          </div>
        </div>

        {/* 登録ボタン */}
        <button
          onClick={handleSubmit}
          disabled={isPending}
          style={submitButtonStyle}
        >
          {isPending ? '登録中...' : 'トライ記録を登録'}
        </button>
      </div>
    </div>
  );
};

const selectStyle = {
  padding: '8px 36px 8px 12px',
  fontSize: 14,
  border: '1px solid #ccc',
  borderRadius: 6,
  background: 'white',
  cursor: 'pointer',
  minWidth: 160,
  appearance: 'auto',
};

const cellSelectStyle = {
  padding: '6px 4px',
  fontSize: 13,
  border: '1px solid #ddd',
  borderRadius: 4,
  background: 'white',
  cursor: 'pointer',
  width: '100%',
};

const remarksInputStyle = {
  padding: '6px 8px',
  fontSize: 13,
  border: '1px solid #ddd',
  borderRadius: 4,
  width: '100%',
  minWidth: 120,
};

const tdStyle = {
  padding: '8px 6px',
  textAlign: 'center',
  borderBottom: '1px solid #f0f0f0',
};

const deleteButtonStyle = {
  width: 28,
  height: 28,
  borderRadius: '50%',
  background: '#333',
  color: 'white',
  border: 'none',
  cursor: 'pointer',
  fontSize: 12,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 0,
};

const addRowButtonStyle = {
  padding: '10px 0',
  width: '100%',
  fontSize: 14,
  fontWeight: 600,
  color: '#333',
  background: 'white',
  border: '2px solid #ccc',
  borderRadius: 6,
  cursor: 'pointer',
  transition: 'background 0.2s',
};

const submitButtonStyle = {
  display: 'block',
  width: '100%',
  padding: '16px 0',
  fontSize: 16,
  fontWeight: 700,
  color: 'white',
  background: '#4caf50',
  border: 'none',
  borderRadius: 8,
  cursor: 'pointer',
  transition: 'background 0.2s',
  marginTop: 0,
};
