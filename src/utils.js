import { defaultFilterFNs } from './filtersFNs';

export function swapArr(arr, dragIndex, hoverIndex) {
  arr[dragIndex] = arr.splice(hoverIndex, 1, arr[dragIndex])[0];
  return arr;
}

// 获取叶子节点
export const getAllLeafColumnDefs = (columns) => {
  let lowestLevelColumns = columns;
  let currentCols = columns;
  while (!!currentCols?.length && currentCols.some((col) => col.columns)) {
    const nextCols = currentCols
      .filter((col) => !!col.columns)
      .map((col) => col.columns)
      .flat();
    if (nextCols.every((col) => !col?.columns)) {
      lowestLevelColumns = [...lowestLevelColumns, ...nextCols];
    }
    currentCols = nextCols;
  }
  return lowestLevelColumns.filter((col) => !col.columns);
};

// 创建显示列
export const createDisplayColumn = (table, column) => table.createDisplayColumn(column);

// 创建数据列
export const createDataColumn = (table, column, currentFilterFns) => {
  return table.createDataColumn(column.id || column.accessorKey, {
    filterFn:
      currentFilterFns[column.id] instanceof Function
        ? currentFilterFns[column.id]
        : defaultFilterFNs[currentFilterFns[column.id]],
    ...column,
  });
}

// 创建数组列
export const createGroup = (table, column, currentFilterFns) => {
  return table.createGroup({
    ...column,
    columns: column?.columns?.map?.((col) =>
      col.columns ? createGroup(table, col, currentFilterFns) : createDataColumn(table, col, currentFilterFns),
    ),
  });
}
