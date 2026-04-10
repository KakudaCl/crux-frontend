import { useState } from 'react';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
import { Button, Dropdown, Form, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import EscalationImage from '../../assets/images/escalation_icon.png';
import FukidashiOkWhiteImage from '../../assets/images/fukidashi_ok_white.svg';
import IroenpitsuBlackImage from '../../assets/images/iroenpitsu_black.svg';
import MarkBatsuImage from '../../assets/images/mark_batsu.svg';
import YellowHoldImage from '../../assets/images/yellow_hold.png';
import { useGyms } from '../../hooks/useGyms';
import { useYears } from '../../hooks/useYears';
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

const noDataStyle = {
  fontFamily: "'Stick No Bills', sans-serif",
  fontWeight: 800,
  fontSize: 26,
  color: '#888',
};

export const TrylogPage = () => {
  const [year, setYear] = useState(
    () =>
      Number(localStorage.getItem('trylogPageYear')) || new Date().getFullYear()
  );
  const [gymId, setGymId] = useState(
    () => Number(localStorage.getItem('trylogPageGymId')) || 1
  );
  const [month, setMonth] = useState(
    () =>
      Number(localStorage.getItem('trylogPageMonth')) ||
      new Date().getMonth() + 1
  );

  /* チェックボックス */
  const [isTimeSort, setIsTimeSort] = useState(false);
  const [isEditResult, setIsEditResult] = useState(false);
  const [isDeleteResult, setIsDeleteResult] = useState(false);

  const [editingTryId, setEditingTryId] = useState(null);

  /* トライログ編集 */
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [pendingUpdateId, setPendingUpdateId] = useState(null);
  const [updateRemarks, setUpdateRemarks] = useState('');

  /* トライログ削除 */
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      await axios.post('/api/trylog/edit', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topRates'] });
      setShowUpdateModal(false);
      setPendingUpdateId(null);
      setEditingTryId(null);
      setUpdateRemarks('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (tryId) => {
      await axios.post(`/api/trylog/delete?try_id=${tryId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topRates'] });
      setShowDeleteModal(false);
      setPendingDeleteId(null);
    },
  });

  const handleDeleteClick = (tryId) => {
    setPendingDeleteId(tryId);
    setShowDeleteModal(true);
  };

  const handleEditClick = (tryId, remarks) => {
    setUpdateRemarks(remarks);
    setEditingTryId(tryId);
  };

  const handleUpdateClick = (tryId) => {
    setPendingUpdateId(tryId);
    setShowUpdateModal(true);
  };

  const handleUpdateConfirm = () => {
    if (pendingUpdateId !== null) {
      updateMutation.mutate({
        try_id: pendingUpdateId,
        remarks: updateRemarks,
      });
    }
  };

  const handleDeleteConfirm = () => {
    if (pendingDeleteId !== null) {
      deleteMutation.mutate(pendingDeleteId);
    }
  };

  const handleUpdateCancel = () => {
    setShowUpdateModal(false);
    setPendingUpdateId(null);
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setPendingDeleteId(null);
  };

  const { data: gymsData } = useGyms();
  const { data: yearsData } = useYears();
  const gyms = gymsData?.gyms_info ?? [];
  const years = Array.isArray(yearsData?.years) ? yearsData.years : [];
  const selectedYear = years.includes(year) ? year : (years[0] ?? year);
  const selectedGymName =
    gyms.find((g) => g.gym_id === gymId)?.gym_name ?? '読み込み中...';

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['topRates', selectedYear, gymId, month, isTimeSort],
    queryFn: async () => {
      const sort_key = isTimeSort ? 'time' : 'prob_no';
      const response = await axios.get(
        `/api/trylog/list?year=${selectedYear}&month=${month}&gym_id=${gymId}&sort=${sort_key}`
      );
      localStorage.setItem('trylogPageYear', selectedYear);
      localStorage.setItem('trylogPageGymId', gymId);
      localStorage.setItem('trylogPageMonth', month);
      return response.data;
    },
  });

  // prob best（season_best と personal_best を1回のリクエストで取得）
  const { data: bestProbData } = useQuery({
    queryKey: ['bestProb', selectedYear, gymId, month],
    queryFn: async () => {
      const response = await axios.get(
        `/api/trylog/best/prob?year=${selectedYear}&gym_id=${gymId}&month=${month}`
      );
      return response.data;
    },
  });

  // count best（season_best と personal_best を1回のリクエストで取得）
  const { data: bestCountData } = useQuery({
    queryKey: ['bestCount', selectedYear, gymId, month],
    queryFn: async () => {
      const response = await axios.get(
        `/api/trylog/best/count?year=${selectedYear}&gym_id=${gymId}&month=${month}`
      );
      return response.data;
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

  const bestProbSeasonBest = bestProbData?.season_best ?? null;
  const bestProbPersonalBest = bestProbData?.personal_best ?? null;
  const bestCountSeasonBest = bestCountData?.season_best ?? null;
  const bestCountPersonalBest = bestCountData?.personal_best ?? null;

  return (
    <div className="result-page">
      <Modal show={showUpdateModal} onHide={handleUpdateCancel} centered>
        <Modal.Header closeButton>
          <Modal.Title
            style={{
              fontFamily: "'Noto Sans JP', sans-serif",
              fontWeight: 800,
            }}
          >
            更新の確認
          </Modal.Title>
        </Modal.Header>
        <Modal.Body
          style={{ fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 800 }}
        >
          トライログを更新してもよろしいですか？
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={handleUpdateCancel}
            style={{
              fontFamily: "'Noto Sans JP', sans-serif",
              fontWeight: 800,
            }}
          >
            キャンセル
          </Button>
          <Button
            variant="primary"
            onClick={handleUpdateConfirm}
            disabled={deleteMutation.isPending}
            style={{
              fontFamily: "'Noto Sans JP', sans-serif",
              fontWeight: 800,
            }}
          >
            {deleteMutation.isPending ? '更新中...' : '更新する'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* トライログ削除時モーダル */}
      <Modal show={showDeleteModal} onHide={handleDeleteCancel} centered>
        <Modal.Header closeButton>
          <Modal.Title
            style={{
              fontFamily: "'Noto Sans JP', sans-serif",
              fontWeight: 800,
            }}
          >
            削除の確認
          </Modal.Title>
        </Modal.Header>
        <Modal.Body
          style={{ fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 800 }}
        >
          このトライログを削除してもよろしいですか？
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={handleDeleteCancel}
            style={{
              fontFamily: "'Noto Sans JP', sans-serif",
              fontWeight: 800,
            }}
          >
            キャンセル
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteConfirm}
            disabled={deleteMutation.isPending}
            style={{
              fontFamily: "'Noto Sans JP', sans-serif",
              fontWeight: 800,
            }}
          >
            {deleteMutation.isPending ? '削除中...' : '削除する'}
          </Button>
        </Modal.Footer>
      </Modal>

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
                {selectedYear}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {years.map((yearItem) => (
                  <Dropdown.Item
                    key={yearItem}
                    onClick={() => setYear(yearItem)}
                  >
                    {yearItem}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>

            <Dropdown>
              <Dropdown.Toggle
                variant="primary"
                id="dropdown-month"
                style={{
                  fontFamily: "'Noto Sans JP', sans-serif",
                  fontWeight: 800,
                }}
              >
                {month}月
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <Dropdown.Item key={m} onClick={() => setMonth(m)}>
                    {m}月
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>
        <div
          className="result-page__header-section-checkbox"
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            fontFamily: "'Noto Sans JP', sans-serif",
            fontWeight: 800,
          }}
        >
          <Form className="d-flex flex-row align-items-center gap-3">
            <Form.Check
              type="checkbox"
              id="sort-checkbox"
              label="トライ順で表示"
              checked={isTimeSort}
              onChange={() => setIsTimeSort((prev) => !prev)}
            />
            <Form.Check
              type="checkbox"
              id="edit-checkbox"
              label="結果を編集"
              checked={isEditResult}
              onChange={() => {
                setIsEditResult((prev) => !prev);
                setIsDeleteResult(false);
                setEditingTryId(null);
              }}
            />
            <Form.Check
              type="checkbox"
              id="delete-checkbox"
              label="結果を削除"
              checked={isDeleteResult}
              onChange={() => {
                setIsDeleteResult((prev) => !prev);
                setIsEditResult(false);
                setEditingTryId(null);
              }}
            />
          </Form>
        </div>

        {trylogInfo.map((trylogData) => {
          return (
            <div key={trylogData.id} className="result-page__chart-container">
              <div className="result-page__chart-title">
                {trylogData.try_date}
              </div>
              <table className="table">
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
                    <th
                      scope="col"
                      style={{ width: isDeleteResult ? '30%' : '40%' }}
                    >
                      Remarks
                    </th>
                    {isDeleteResult && (
                      <th scope="col" style={{ width: '10%' }} />
                    )}
                    {isEditResult && (
                      <th scope="col" style={{ width: '10%' }} />
                    )}
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
                        {editingTryId === log.try_id ? (
                          <>
                            <Form.Control
                              type="text"
                              value={updateRemarks}
                              onChange={(e) => setUpdateRemarks(e.target.value)}
                            />
                          </>
                        ) : (
                          log.remarks
                        )}
                      </td>
                      {isDeleteResult && (
                        <td
                          style={{
                            verticalAlign: 'middle',
                            textAlign: 'center',
                          }}
                        >
                          {/* 削除ボタン */}
                          <button
                            onClick={() => handleDeleteClick(log.try_id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: 20,
                              color: '#e53935',
                              lineHeight: 1,
                              padding: '4px 8px',
                            }}
                            aria-label="削除"
                          >
                            <img src={MarkBatsuImage} style={{ width: '20px', height: '20px' }}></img>
                          </button>
                        </td>
                      )}
                      {/* 編集ボタン */}
                      {isEditResult && (
                        <td
                          style={{
                            verticalAlign: 'middle',
                            textAlign: 'center',
                          }}
                        >
                          {editingTryId === log.try_id ? (
                            <button
                              onClick={() => handleUpdateClick(log.try_id)}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: 20,
                                color: '#00ff00',
                                lineHeight: 1,
                                padding: '4px 8px',
                              }}
                              aria-label="更新"
                            >
                              <img
                                src={FukidashiOkWhiteImage}
                                style={{ width: '20px', height: '20px' }}
                              ></img>
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                handleEditClick(log.try_id, log.remarks)
                              }
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: 20,
                                color: '#00ff00',
                                lineHeight: 1,
                                padding: '4px 8px',
                              }}
                              aria-label="編集"
                            >
                              <img
                                src={IroenpitsuBlackImage}
                                style={{ width: '20px', height: '20px' }}
                              ></img>
                            </button>
                          )}
                        </td>
                      )}
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
          {bestProbSeasonBest || bestProbPersonalBest ? (
            <>
              {/* Prob Season Best */}
              <div className="col-6">
                <div style={bestCardStyle}>
                  <div style={bestCardTitleStyle}>
                    PROB SEASON BEST {selectedYear}
                  </div>
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
                    <div style={noDataStyle}>NO DATA</div>
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
                    <div style={noDataStyle}>NO DATA</div>
                  )}
                </div>
              </div>
            </>
          ) : null}

          {/* Count Season Best */}
          <div className="col-6">
            <div style={bestCardStyle}>
              <div style={bestCardTitleStyle}>
                COUNT SEASON BEST {selectedYear}
              </div>
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
                <div style={noDataStyle}>NO DATA</div>
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
                <div style={noDataStyle}>NO DATA</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
