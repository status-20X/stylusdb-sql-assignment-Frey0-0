const { parseQuery } = require("./queryParser");
const readCSV = require("./csvReader");

async function executeSELECTQuery(query) {
  try {
    const { fields, table, whereClauses, joinTable, joinType, joinCondition } =
      parseQuery(query);
    let data = await readCSV(`${table}.csv`);
    // Perform INNER JOIN if specified
    if (joinTable && joinCondition) {
      const joinData = await readCSV(`${joinTable}.csv`);
      switch (joinType.toUpperCase()) {
        case "INNER":
          data = performInnerJoin(data, joinData, joinCondition, fields, table);
          break;
        case "LEFT":
          data = performLeftJoin(data, joinData, joinCondition, fields, table);
          break;
        case "RIGHT":
          data = performRightJoin(data, joinData, joinCondition, fields, table);
          break;
        // Handle default case or unsupported JOIN types
      }
    }
    console.log(data, 'hmm');
    // Apply WHERE clause filtering after JOIN (or on the original data if no join)
    const filteredData =
      whereClauses.length > 0
        ? data.filter((row) =>
            whereClauses.every((clause) => evaluateCondition(row, clause))
          )
        : data;

    // Map the selected fields
    return filteredData.map((row) => {
      const selectedRow = {};
      fields.forEach((field) => {
        selectedRow[field] = row[field];
      });
      return selectedRow;
    });
  } catch (error) {
    console.error(error.message);
    return []; // or any other appropriate action
  }
}

function evaluateCondition(row, clause) {
  const { field, operator, value } = clause;

  // Get the actual value from the row
  const actualValue = row[field];

  // Convert the actual value and the value in the condition to appropriate types for comparison
  const convertedActualValue = isNaN(actualValue)
    ? actualValue
    : parseFloat(actualValue);
  const convertedValue = isNaN(value) ? value : parseFloat(value);

  // Perform the comparison based on the operator
  switch (operator) {
    case "=":
      return convertedActualValue === convertedValue;
    case "!=":
      return convertedActualValue !== convertedValue;
    case ">":
      return convertedActualValue > convertedValue;
    case "<":
      return convertedActualValue < convertedValue;
    case ">=":
      return convertedActualValue >= convertedValue;
    case "<=":
      return convertedActualValue <= convertedValue;
    default:
      throw new Error(`Unsupported operator: ${operator}`);
  }
}

// Function to perform Inner Join
function performInnerJoin(data, joinData, joinCondition, fields, table) {
  return data.flatMap((mainRow) => {
    return joinData
      .filter((joinRow) => {
        const mainValue = mainRow[joinCondition.left.split(".")[1]];
        const joinValue = joinRow[joinCondition.right.split(".")[1]];
        return mainValue === joinValue;
      })
      .map((joinRow) => {
        return fields.reduce((acc, field) => {
          const [tableName, fieldName] = field.split(".");
          acc[field] =
            tableName === table ? mainRow[fieldName] : joinRow[fieldName];
          return acc;
        }, {});
      });
  });
}
// Function to perform Left Join
function performLeftJoin(mainData, joinData, joinCondition, fields, table) {
  return mainData.flatMap((mainRow) => {
    const matchingJoinRows = joinData.filter((joinRow) => {
      const mainValue = mainRow[joinCondition.left.split(".")[1]];
      const joinValue = joinRow[joinCondition.right.split(".")[1]];
      return mainValue === joinValue;
    });

    if (matchingJoinRows.length === 0) {
      return fields.reduce((acc, field) => {
        const [tableName, fieldName] = field.split(".");
        acc[field] = tableName === table ? mainRow[fieldName] : null;
        return acc;
      }, {});
    }

    return matchingJoinRows.map((joinRow) => {
      return fields.reduce((acc, field) => {
        const [tableName, fieldName] = field.split(".");
        acc[field] =
          tableName === table ? mainRow[fieldName] : joinRow[fieldName];
        return acc;
      }, {});
    });
  });
}

// Function to perform Right Join
function performRightJoin(mainData, joinData, joinCondition, fields, table) {
  return joinData.flatMap((joinRow) => {
    const matchingMainRows = mainData.filter((mainRow) => {
      const mainValue = mainRow[joinCondition.left.split(".")[1]];
      const joinValue = joinRow[joinCondition.right.split(".")[1]];
      return mainValue === joinValue;
    });

    if (matchingMainRows.length === 0) {
      return fields.reduce((acc, field) => {
        const [tableName, fieldName] = field.split(".");
        acc[field] = tableName === table ? null : joinRow[fieldName];
        return acc;
      }, {});
    }

    return matchingMainRows.map((mainRow) => {
      return fields.reduce((acc, field) => {
        const [tableName, fieldName] = field.split(".");
        acc[field] =
          tableName === table ? mainRow[fieldName] : joinRow[fieldName];
        return acc;
      }, {});
    });
  });
}

module.exports = executeSELECTQuery;
