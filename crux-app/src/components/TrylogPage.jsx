import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import axios from 'axios'
import 'bootstrap/dist/css/bootstrap.min.css'
import { Dropdown } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import BlueHoldImage from '../images/blue_hold.png'
import GreenHoldImage from '../images/green_hold.png'
import YellowHoldImage from '../images/yellow_hold.png'
import EscalationImage from '../images/escalation_icon.png'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

const GRADE_COLORS = {
  V1: 'rgb(228, 228, 5)',
  V2: 'rgb(255, 0, 0)',
  V3: 'rgb(139, 69, 19)',
  V4: 'rgb(134, 134, 134)',
  入門: 'rgb(255, 182, 193)',
  '8-6Q': 'rgb(255, 165, 0)',
  '5Q': 'rgb(231, 231, 231)',
  '4Q': 'rgb(225, 225, 0)',
  '3Q': 'rgb(0, 128, 0)',
  '2Q': 'rgb(255, 0, 0)',
}

function buildChartData(gradeData) {
  const grade = gradeData.grade
  const monthlyData = gradeData.monthly_info || []
  const displayData = []
  const actualData = []

  monthlyData.forEach((item) => {
    if (item.top_rate === null) {
      displayData.push(null)
    } else if (item.top_rate === 0 && item.boulder_count >= 1) {
      displayData.push(0.4)
    } else {
      displayData.push(item.top_rate)
    }
    actualData.push(item)
  })

  return {
    labels: monthlyData.map((item) => item.month),
    datasets: [
      {
        label: `${grade} Top Rate (%)`,
        data: displayData,
        backgroundColor: GRADE_COLORS[grade] ?? 'rgb(128, 128, 128)',
        borderColor: grade === "5級" ? 'rgb(200, 200, 200)' : GRADE_COLORS[grade] || 'rgb(128, 128, 128)',
        borderWidth: grade === "5級" ? 2 : 1,
      },
    ],
    _actualData: actualData,
  }
}

const chartOptions = (actualData) => ({
  responsive: true,
  maintainAspectRatio: true,
  scales: {
    y: {
      beginAtZero: true,
      max: 100,
      title: {
        display: true,
        text: 'Top Rate (%)',
      },
    },
    x: {
      title: {
        display: true,
        text: 'Month',
      },
    },
  },
  plugins: {
    tooltip: {
      enabled: true,
      mode: 'index',
      intersect: false,
      callbacks: {
        title: (context) => context[0]?.label ?? '',
        label: (context) => {
          const index = context.dataIndex
          if (index >= 0 && index < actualData.length) {
            const item = actualData[index]
            if (item.top_rate === null) return []
            return [
              `Top Rate: ${item.top_rate}%`,
              `Boulder Count: ${item.boulder_count}`,
              `Top Count: ${item.top_count}`,
            ]
          }
          return []
        },
      },
    },
    legend: {
      display: false,
    },
  },
})

const getResultColor = (result) => {
  const colorMap = {
    'FLASH': '#ff00ff',
    'TOP': '#e60033',
    'ZONE': '#f08300',
    'N.S.': '#c0c6c9'
  };
  return colorMap[result] || '#000000';  // デフォルトは黒
};


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
      <header className="result-page__header">
        <div className="result-page__header-logo">BOLLOG</div>
        <nav className="result-page__header-nav">
          <Link to="/month" className="result-page__nav-link result-page__nav-link--month">
            <img src={GreenHoldImage} style={{ width: '20px', marginRight: '10px' }} alt="マンスリー別完登率" />
            マンスリー別完登率
          </Link>
          <Link to="/area" className="result-page__nav-link result-page__nav-link--area">
            <img src={BlueHoldImage} style={{ width: '20px', marginRight: '10px' }} alt="エリア別完登率" />
            エリア別完登率
          </Link>
          <Link to="/trylog" className="result-page__nav-link result-page__nav-link--trylog result-page__nav-link--active">
            <img src={YellowHoldImage} style={{ width: '17px', marginRight: '10px' }} alt="トライログ" />
            トライログ
          </Link>
        </nav>
      </header>

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
