const parseQuery = require('./queryParser');
const readCSV = require('./csvReader');

async function executeSELECTQuery(query) {
    try {
        const { fields, table, whereClause } = parseQuery(query);
        const data = await readCSV(`${table}.csv`);
        
        // Apply WHERE clause filter
        const filteredData = applyWhereClause(data, whereClause);

        // Filter the fields based on the query
        return filteredData.map(row => {
            const filteredRow = {};
            fields.forEach(field => {
                filteredRow[field] = row[field];
            });
            return filteredRow;
        });
    } catch (error) {
        console.error(error.message);
        return [];
    }
}

function applyWhereClause(data, whereClause) {
  if (!whereClause) {
      return data;
  }

  const [field, value] = whereClause.split('=').map(part => part.trim());
  return data.filter(row => {
      return row[field] === value;
  });
}

module.exports = executeSELECTQuery;
