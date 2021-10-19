/**
 * Generates default export name value.
 * @return {string}
 */
export function generateFileName() {
  const date = new Date();
  const day = date.getDate();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  return `arc-data-export-${day}-${month}-${year}.json`;
}
