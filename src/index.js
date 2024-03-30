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
    return []; // or any other appropriate action
  }
}

function applyWhereClauses(data, whereClauses) {
  if (!whereClauses || whereClauses.length === 0) {
    return data;
  }

  return data.filter((row) => {
    return whereClauses.every(({ field, operator, value }) => {
      if (operator === "=") {
        return row[field] === value;
      }
      return false;
    });
  });
}

module.exports = executeSELECTQuery;
