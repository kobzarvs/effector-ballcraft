export function updateCol(columns, id, cb) {
  columns = [...columns]
  columns[id] = [...columns[id]]
  cb(columns[id])
  return columns
}
