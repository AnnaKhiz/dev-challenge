const allowedExcelTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
const allowedTypes = ['text/csv', 'application/json', ...allowedExcelTypes];

export function checkFileType(file) {
  return allowedTypes.includes(file.type)
}

export function isJSON(data) {
  try {
    JSON.parse(data);
    return true
  } catch (error) {
    return false
  }
}


