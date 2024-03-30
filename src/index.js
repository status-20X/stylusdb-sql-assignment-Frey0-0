const parseQuery = require("./queryParser");
const readCSV = require("./csvReader");

async function executeSELECTQuery(query) {
  try {
    const { fields, table, whereClauses } = parseQuery(query);
    const data = await readCSV(`${table}.csv`);

    // Apply WHERE clause filter
    const filteredData = applyWhereClauses(data, whereClauses);

    // Filter the fields based on the query
    return filteredData.map((row) => {
      const filteredRow = {};
      fields.forEach((field) => {
        filteredRow[field] = row[field];
      });
      return filteredRow;
    });
  } catch (error) {
    console.error(error.message);
    return []; 
  }
}

function applyWhereClauses(data, whereClauses) {
  if (!whereClauses || whereClauses.length === 0) {
    return data;
  }

  return data.filter((row) => {
    return whereClauses.every(({ field, operator, value }) => {
      switch (operator) {
        case "=":
          return row[field] === value;
        case "!=":
          return row[field] !== value;
        case ">":
          return row[field] > value;
        case "<":
          return row[field] < value;
        case ">=":
          return row[field] >= value;
        case "<=":
          return row[field] <= value;
        default:
          return false;
      }
    });
  });
}

module.exports = executeSELECTQuery;
