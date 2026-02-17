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
import GreenHoldImage from '../images/green_hold.png'
import BlueHoldImage from '../images/blue_hold.png'
import YellowHoldImage from '../images/yellow_hold.png'

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
  const grade_color = '#' + gradeData.grade_color
  const areaData = gradeData.area_info || []
  const displayData = []
  const actualData = []

  areaData.forEach((item) => {
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
    labels: areaData.map((item) => item.area_name),
    datasets: [
      {
        label: `${grade} Top Rate (%)`,
        data: displayData,
        backgroundColor: grade_color ?? 'rgb(128, 128, 128)',
        borderColor: grade === '5級' ? 'rgb(200, 200, 200)' : grade_color || 'rgb(128, 128, 128)',
        borderWidth: grade === '5級' ? 2 : 1,
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
        text: 'Area',
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

export const ResultPageArea = () => {
  const [year, setYear] = useState(new Date().getFullYear())
  const [gymId, setGymId] = useState(3)
  const [period, setPeriod] = useState(3)

  const { data, isLoading, error } = useQuery({
    queryKey: ['topRatesByArea', year, gymId, period],
    queryFn: async () => {
      const response = await axios.get(`/api/top_rates_area?year=${year}&gym_id=${gymId}&period=${period}`)
      return response.data
    },
  })

  if (isLoading) {
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

  const resultInfo = data?.result_info ?? []

  return (
    <div className="result-page">
      {/* ヘッダー */}
      <header className="result-page__header">
        <div className="result-page__header-logo">BOLLOG</div>
        <nav className="result-page__header-nav">
          <Link to="/month" className="result-page__nav-link result-page__nav-link--month">
            <img src={GreenHoldImage} style={{ width: '20px', height: '20px', marginRight: '10px' }} alt="マンスリー別完登率" />
            マンスリー別完登率
          </Link>
          <Link to="/area" className="result-page__nav-link result-page__nav-link--area result-page__nav-link--active">
            <img src={BlueHoldImage} style={{ width: '20px', height: '20px', marginRight: '10px' }} alt="エリア別完登率" />
            エリア別完登率
          </Link>
          <Link to="/trylog" className="result-page__nav-link result-page__nav-link--trylog">
            <img src={YellowHoldImage} style={{ width: '17px', marginRight: '10px' }} alt="トライログ" />
            トライログ
          </Link>
        </nav>
      </header>

      <div className="result-page__container">
      <div className="result-page__header-section">
          <h1 className="result-page__title">
            <img src={BlueHoldImage} style={{ width: '9%', marginRight: '20px' }} alt="エリア別完登率" />
            エリア別完登率
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
                id="dropdown-period"
                style={{ fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 800 }}
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
                <Dropdown.Item onClick={() => setPeriod(3)}>
                  年間
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

          </div>
        </div>
        
        {resultInfo.map((gradeData) => {
          const chartData = buildChartData(gradeData)
          const actualData = chartData._actualData
          const { _actualData, ...barData } = chartData

          return (
            <div key={gradeData.grade} className="result-page__chart-container">
              <div 
                className="result-page__chart-title" 
                style={{ color: '#' + gradeData.grade_color || 'rgb(128, 128, 128)' }}
              >
                {gradeData.grade}
              </div>
              <div className="result-page__chart-wrapper">
                <Bar data={barData} options={chartOptions(actualData)} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
