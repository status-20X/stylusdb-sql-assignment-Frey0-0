function parseQuery(query) {
  const selectRegex = /SELECT (.+?) FROM (.+?)(?: WHERE (.*))?$/i;
  const match = query.match(selectRegex);

  if (!match) {
    throw new Error("Invalid query format: Unable to parse query");
  }

  const [, fields, table, whereString] = match;

  try {
    const whereClauses = whereString ? parseWhereClause(whereString) : [];
    return {
      fields: fields.split(",").map((field) => field.trim()),
      table: table.trim(),
      whereClauses,
    };
  } catch (error) {
    throw new Error(`Invalid query format: ${error.message}`);
  }
}

function parseWhereClause(whereString) {
  const conditionRegex = /(.*?)(=|!=|>|<|>=|<=)(.*)/;
  return whereString.split(/ AND | OR /i).map((conditionString) => {
    const match = conditionString.match(conditionRegex);
    if (match) {
      const [, field, operator, value] = match;
      return { field: field.trim(), operator, value: value.trim() };
    }
    throw new Error("Invalid WHERE clause format");
  });
}
module.exports = parseQuery;
