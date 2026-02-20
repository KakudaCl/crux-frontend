export function buildChartData(
  gradeData,
  dataKey = 'monthly_info',
  labelKey = 'month'
) {
  const grade = gradeData.grade;
  const grade_color = '#' + gradeData.grade_color;
  const sourceData = gradeData[dataKey] || [];
  const displayData = [];
  const actualData = [];

  sourceData.forEach((item) => {
    if (item.top_rate === null) {
      displayData.push(null);
    } else if (item.top_rate === 0 && item.boulder_count >= 1) {
      displayData.push(0.4);
    } else {
      displayData.push(item.top_rate);
    }
    actualData.push(item);
  });

  return {
    labels: sourceData.map((item) => item[labelKey]),
    datasets: [
      {
        label: `${grade} Top Rate (%)`,
        data: displayData,
        backgroundColor: grade_color ?? 'rgb(128, 128, 128)',
        borderColor:
          grade === '5級'
            ? 'rgb(200, 200, 200)'
            : grade_color || 'rgb(128, 128, 128)',
        borderWidth: grade === '5級' ? 2 : 1,
      },
    ],
    _actualData: actualData,
  };
}
