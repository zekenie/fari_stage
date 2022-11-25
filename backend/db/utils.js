// I don't see this being used, but this type of manual query 
// maniuplation makes you vulnerable to injection attacks.
// If you want to do something like this, consider using the 
// `slonik` npm package.
function dbFields(fields) {
  const insert = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(", ");

  const select = Object.keys(fields)
    .map((_, index) => `$${index + 1}`)
    .join(", ");

  const vals = Object.values(fields);
  return { insert, select, vals };
}
module.exports = {
  dbFields,
};
