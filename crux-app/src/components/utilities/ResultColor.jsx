const COLOR_MAP = {
  FLASH: '#ff00ff',
  TOP: '#e60033',
  ZONE: '#f08300',
  'N.S.': '#c0c6c9',
};

export const getResultColor = (result) => COLOR_MAP[result] || '#000000';
