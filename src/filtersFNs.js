export const select = (row, id, filterValue) => {
  const rowValue = row.values[id]
  return rowValue !== undefined
    ? String(rowValue)
      .toLowerCase()
      .includes(String(filterValue).toLowerCase())
    : true
}

export const checkbox = (row, id, filterValue) => {
  const rowValue = row.original[id]
  return (!!rowValue && filterValue.length)
    ? filterValue.includes(rowValue)
    : true
}

export const text = (row, id, filterValue) => {
  const rowValue = row.values[id]
  return rowValue !== undefined
    ? String(rowValue)
      .toLowerCase()
      .startsWith(String(filterValue).toLowerCase())
    : true
}

export const defaultFilterFNs = {
  text,
  select,
  checkbox,
};