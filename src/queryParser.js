function parseQuery(query) {
  // First, let's trim the query to remove any leading/trailing whitespaces
  query = query.trim();

  // Initialize variables for different parts of the query
  let selectPart, joinPart, wherePart;

  // Split the query at the WHERE clause if it exists
  const whereSplit = query.split(/\s+WHERE\s+/i);
  selectPart = whereSplit[0]; // Everything before WHERE clause
  wherePart = whereSplit[1]; // Everything after WHERE clause (may be undefined)

  // Split the remaining query at the JOIN clause if it exists
  const joinSplit = selectPart.split(/\s+INNER JOIN\s+/i);
  selectPart = joinSplit[0]; // Everything before JOIN clause
  joinPart = joinSplit[1]; // Everything after JOIN clause (may be undefined)

  // Parse the SELECT part
  const selectRegex = /^SELECT\s+(.+?)\s+FROM\s+(.+)$/i;
  const selectMatch = selectPart.match(selectRegex);
  if (!selectMatch) {
    throw new Error("Invalid SELECT format");
  }

  const [, fields, table] = selectMatch;

  // Parse the JOIN part if it exists
  let joinTable = null,
    joinCondition = null;
  if (joinPart) {
    const joinRegex = /^(.+?)\s+ON\s+(.+)$/i;
    const joinMatch = joinPart.match(joinRegex);
    if (!joinMatch) {
      throw new Error("Invalid JOIN format");
    }

    joinTable = joinMatch[1].trim();
    const joinConditionParts = joinMatch[2].split(/\s*=\s*/);
    if (joinConditionParts.length !== 2) {
      throw new Error("Invalid JOIN condition format");
    }

    joinCondition = {
      left: joinConditionParts[0].trim(),
      right: joinConditionParts[1].trim(),
    };
  }

  // Parse the WHERE part if it exists
  let whereClauses = [];
  if (wherePart) {
    whereClauses = parseWhereClause(wherePart);
  }

  return {
    fields: fields.split(",").map((field) => field.trim()),
    table: table.trim(),
    whereClauses,
    joinTable,
    joinCondition,
  };
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
