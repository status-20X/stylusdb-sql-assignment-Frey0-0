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
  const conditions = whereString.split(/ AND | OR /i);
  return conditions.map((condition) => {
    const [field, operator, value] = condition.split(/\s+/);
    if (!field || !operator || !value) {
      throw new Error("Invalid where clause format");
    }
    return { field, operator, value };
  });
}

module.exports = parseQuery;
