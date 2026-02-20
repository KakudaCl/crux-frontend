import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import axios from 'axios'
import 'bootstrap/dist/css/bootstrap.min.css'
import { Dropdown } from 'react-bootstrap'
import { PageHeader } from '../parts/PageHeader'
import { getResultColor } from '../utilities/ResultColor'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import YellowHoldImage from '../../assets/images/yellow_hold.png'
import EscalationImage from '../../assets/images/escalation_icon.png'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

export const TrylogPage = () => {

  const [year, setYear] = useState(new Date().getFullYear())
  const [gymId, setGymId] = useState(3)
  const [month, setMonth] = useState(new Date().getMonth() + 1)

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['topRates', year, gymId, month],
    queryFn: async () => {
      const response = await axios.get(`/api/trylog?year=${year}&month=${month}&gym_id=${gymId}`)
      return response.data
    },
  })

  if (isLoading || isFetching) {
    return (
      <div className="result-page">
        <div className="result-page__container">
          <p>読み込み中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="result-page">
        <div className="result-page__container">
          <p>エラー: {error.message}</p>
        </div>
      </div>
    )
  }

  const trylogInfo = data?.all_logs ?? []

  return (
    <div className="result-page">
      {/* ヘッダー */}
      <PageHeader />

      <div className="result-page__container">
        {/* タイトルとドロップダウンを横並びに */}
        <div className="result-page__header-section">
          <h1 className="result-page__title">
            <img src={YellowHoldImage} style={{ width: '8%', marginRight: '10px' }} alt="トライログ" />
            トライログ
            <img src={EscalationImage} style={{ width: '40px', marginLeft: '10px', marginBottom: '6px' }}/>
          </h1>
          <div className="result-page__controls">
            <Dropdown>
              <Dropdown.Toggle 
                variant="primary" 
                id="dropdown-gym"
                style={{ fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 800 }}
              >
                {gymId === 1 ? 'Dボルダリングなんば' : gymId === 2 ? 'クライミングバム大阪店' : 'CRUX大阪'}
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
                style={{ fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 800 }}
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
                style={{ fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 800 }}
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
                    <th scope="col" style={{width: '15%'}}>#</th>
                    <th scope="col" style={{width: '15%'}}>Result</th>
                    <th scope="col" style={{width: '20%'}}>Area</th>
                    <th scope="col" style={{width: '10%'}}>Day</th>
                    <th scope="col" style={{width: '40%'}}>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {trylogData.try_log.map((log) => (
                    <tr key={log.prob_no}>
                      <td scope="row" style={{ fontFamily: "'Stick No Bills', sans-serif", fontWeight: 800, fontSize: 26, verticalAlign: 'middle', color: `#${log.grade_color}` }}>{log.prob_no}</td>
                      <td style={{ fontFamily: "'Stick No Bills', sans-serif", fontWeight: 800, fontSize: 26, verticalAlign: 'middle', color: getResultColor(log.result) }}>{log.result}</td>
                      <td style={{ fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 800, fontSize: 16, verticalAlign: 'middle' }}>{log.area}</td>
                      <td style={{ fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 800, fontSize: 16, verticalAlign: 'middle' }}>{log.day_count}</td>
                      <td style={{ fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 800, fontSize: 16, verticalAlign: 'middle' }}>{log.remarks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        })}
      </div>
    </div>
  )
}
