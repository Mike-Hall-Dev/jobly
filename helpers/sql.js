const { BadRequestError } = require("../expressError");

/** Helper function that makes writing dynamic parameterized SQL update queries easy
 *  
 * The function expects two parameters, both of which should be objects
 * 
 * dataToUpdate should contain fields and values where the fields are attributes 
 * of the model being updated and values being the new values change to. This data
 * will be pulled from the request body.
 *      Example = {username: New Username, email: New@email.com}
 * 
 * jsToSql is the 2nd parameter used to map our JS fieldnames to the correct SQL names
 * so that we can execute a valid query. This will be passed in manually depending
 * on the particular database table being updated.
 *      Exmaple = {isAdmin: is_admin, lastName: last_name}
 * 
 * This function returns an object to be used in the parameterized SQL query 
 *      Example = {setCols: '"username"=$1, "last_name"=$2',
 *                 values: ['Dan The Man', 'Henderson']}

 */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
    `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
