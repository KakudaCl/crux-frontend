export const chartOptions = (actualData, x_title) => ({
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
        text: x_title,
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
          const index = context.dataIndex;
          if (index >= 0 && index < actualData.length) {
            const item = actualData[index];
            if (item.top_rate === null) return [];
            return [
              `Top Rate: ${item.top_rate}%`,
              `Boulder Count: ${item.boulder_count}`,
              `Top Count: ${item.top_count}`,
            ];
          }
          return [];
        },
      },
    },
    legend: {
      display: false,
    },
  },
});
