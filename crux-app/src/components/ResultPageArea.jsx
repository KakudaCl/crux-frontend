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
  V1: 'rgb(255, 255, 0)',
  V2: 'rgb(255, 0, 0)',
  V3: 'rgb(139, 69, 19)',
  入門: 'rgb(255, 182, 193)',
  '8-6級': 'rgb(255, 165, 0)',
  '5級': 'rgb(255, 255, 255)',
  '4級': 'rgb(255, 255, 0)',
  '3級': 'rgb(0, 128, 0)',
  '2級': 'rgb(255, 0, 0)',
}

function buildChartData(gradeData) {
  const grade = gradeData.grade
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
        backgroundColor: GRADE_COLORS[grade] ?? 'rgb(128, 128, 128)',
        borderColor: grade === '5級' ? 'rgb(200, 200, 200)' : GRADE_COLORS[grade] || 'rgb(128, 128, 128)',
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
  const [year, setYear] = useState(2025)
  const [gymId, setGymId] = useState(2)

  const { data, isLoading, error } = useQuery({
    queryKey: ['topRatesByArea', year, gymId],
    queryFn: async () => {
      const response = await axios.get(`/api/top_rates_area?year=${year}&gym_id=${gymId}&period=3`)
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
      <div className="result-page__container">
        <select id="year" value={year} onChange={(e) => setYear(Number(e.target.value))}>
          <option value={2025}>2025</option>
          <option value={2026}>2026</option>
        </select>
        <select id="gymId" value={gymId} onChange={(e) => setGymId(Number(e.target.value))}>
          <option value={2}>BMO</option>
          <option value={3}>CRX</option>
        </select>
        <h1 className="result-page__title">
          {year} {gymId === 2 ? 'BMO' : 'CRX'} Area - Top Rate by Area
        </h1>

        {resultInfo.map((gradeData) => {
          const chartData = buildChartData(gradeData)
          const actualData = chartData._actualData
          const { _actualData, ...barData } = chartData

          return (
            <div key={gradeData.grade} className="result-page__chart-container">
              <div className="result-page__chart-title">{gradeData.grade}</div>
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
