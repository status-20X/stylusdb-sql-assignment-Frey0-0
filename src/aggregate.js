function calculateCount(data) {
  return data.length;
}

// Helper function to calculate SUM
function calculateSum(data, field) {
  return data.reduce((sum, row) => sum + row[field], 0);
}

// Helper function to calculate AVG
function calculateAvg(data, field) {
  const sum = calculateSum(data, field);
  return sum / data.length;
}

// Helper function to calculate MIN
function calculateMin(data, field) {
  return Math.min(...data.map(row => row[field]));
}

// Helper function to calculate MAX
function calculateMax(data, field) {
  return Math.max(...data.map(row => row[field]));
}


module.exports = {
  calculateCount,
  calculateSum,
  calculateAvg,
  calculateMin,
  calculateMax
};