export const getResultColor = (result) => {
  const colorMap = {
    FLASH: '#ff00ff',
    TOP: '#e60033',
    ZONE: '#f08300',
    'N.S.': '#c0c6c9',
  };
  return colorMap[result] || '#000000'; // デフォルトは黒
};
