import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import axios from 'axios'
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

export const ResultPage = () => {

  const [year, setYear] = useState(2025)
  const [gymId, setGymId] = useState(3)

  const [gymForm, setGymForm] = useState({
    gyms: [2, 3]
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['topRates', year, gymId],
    queryFn: async () => {
      const response = await axios.get(`/api/top_rates?year=${year}&gym_id=${gymId}`)
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
          <a href="#" className="result-page__nav-link result-page__nav-link--active">マンスリー別完登率</a>
          <a href="#" className="result-page__nav-link">エリア別完登率</a>
          <a href="#" className="result-page__nav-link">トライログ</a>
        </nav>
      </header>

      <div className="result-page__container">
        {/* タイトルとドロップダウンを横並びに */}
        <div className="result-page__header-section">
          <h1 className="result-page__title">マンスリー別完登率</h1>
          <div className="result-page__controls">
            <select 
              className="result-page__select" 
              id="gymId" 
              value={gymId} 
              onChange={(e) => setGymId(Number(e.target.value))}
            >
              <option value="2">クライミングバム大阪店</option>
              <option value="3">CRUX大阪</option>             
            </select>
            <select 
              className="result-page__select" 
              id="year" 
              value={year} 
              onChange={(e) => setYear(Number(e.target.value))}
            >
              <option value="2025">2025</option>
              <option value="2026">2026</option>
            </select>
          </div>
        </div>

        {/* マンスリー別チャート */}
        {resultInfo.map((gradeData) => {
          const chartData = buildChartData(gradeData)
          const actualData = chartData._actualData
          const { _actualData, ...barData } = chartData

          return (
            <div key={gradeData.grade} className="result-page__chart-container">
              <div 
                className="result-page__chart-title" 
                style={{ color: GRADE_COLORS[gradeData.grade] || 'rgb(128, 128, 128)' }}
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
