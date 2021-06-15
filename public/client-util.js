/**
 * If thousands or more, use format like 12.3K
 * Otherwise if whole number, don't include decimal places
 * Otherwise use 2 decimal points by default
 */
function formatNumberValue(number, forceThousandsFormat) {
  if (number === null) return '-';
  return forceThousandsFormat || Math.abs(number) >= 1000
    ? (number / 1000).toFixed(1) + 'K'
    : number === Math.floor(number) ? number : number.toFixed(2);
}

function getMostRecentStats() {
  return fetch('/api/getMostRecentStats')
    .then((res) => res.json())
    .then((data) => {
      console.log('Most recent general stats', data);
      return data;
    })
    .catch((err) => {
      console.error('Error getting most recent general stats', err);
      return null;
    });
}

function getComparisonStats() {
  return fetch('/api/getComparisonStats')
    .then((res) => res.json())
    .then((data) => {
      console.log('Comparison general stats', data);
      return data;
    })
    .catch((err) => {
      console.error('Error getting comparison general stats', err);
      return null;
    });
}
