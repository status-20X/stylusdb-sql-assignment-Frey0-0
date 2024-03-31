function parseQuery(query) {
  // First, let's trim the query to remove any leading/trailing whitespaces
  query = query.trim();

  // Initialize variables for different parts of the query
  let selectPart, joinPart, wherePart;

  // Split the query at the WHERE clause if it exists
  const whereSplit = query.split(/\s+WHERE\s+/i);
  selectPart = whereSplit[0]; // Everything before WHERE clause
  wherePart = whereSplit[1]; // Everything after WHERE clause (may be undefined)

  // Parse the JOIN part if it exists
  const { joinType, joinTable, joinCondition } = parseJoinClause(selectPart);
  selectPart = joinType ? selectPart.replace(joinType, "") : selectPart;

  // Parse the SELECT part
  const selectRegex = /^SELECT\s+(.+?)\s+FROM\s+(\w+)\s*/i;
  const selectMatch = selectPart.match(selectRegex);
  if (!selectMatch) {
    throw new Error("Invalid SELECT format");
  }

  const [, fields, table] = selectMatch;

  // Parse the WHERE part if it exists
  let whereClauses = [];
  if (wherePart) {
    whereClauses = parseWhereClause(wherePart);
  }

  return {
    fields: fields.split(",").map((field) => field.trim()),
    table: table.trim(),
    whereClauses,
    joinType,
    joinTable,
    joinCondition,
  };
}

function parseJoinClause(query) {
  const joinRegex =
    /\s(INNER|LEFT|RIGHT) JOIN\s(.+?)\sON\s([\w.]+)\s*=\s*([\w.]+)/i;
  const joinMatch = query.match(joinRegex);

  if (joinMatch) {
    return {
      joinType: joinMatch[1].trim(),
      joinTable: joinMatch[2].trim(),
      joinCondition: {
        left: joinMatch[3].trim(),
        right: joinMatch[4].trim(),
      },
    };
  }

  return {
    joinType: null,
    joinTable: null,
    joinCondition: null,
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

module.exports = { parseQuery, parseJoinClause };