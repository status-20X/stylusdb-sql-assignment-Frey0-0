const parseQuery = require('./queryParser');
const readCSV = require('./csvReader');

async function executeSELECTQuery(query) {
  try {
      const { fields, table } = parseQuery(query);
      const data = await readCSV(`${table}.csv`);

      // Filter the fields based on the query
      return data.map(row => {
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

module.exports = executeSELECTQuery;