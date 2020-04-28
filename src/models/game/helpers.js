export function updateCol(columns, id, cb) {
  columns = [...columns]
  columns[id] = [...columns[id]]
  cb(columns[id])
  return columns
}

export const shortenUrl = async (longUrl) => {
  const res = await fetch(`/api/url?url=${longUrl}`)
  if (res.ok) {
    return await res.json().data
  }
  return null
}
