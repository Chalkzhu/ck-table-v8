import cn from 'classnames';

// 单元格统一样式
const cellStyle = ({ getSize, getStart, tableInstance, ...column }) => {
  const { minSize, maxSize, align, getIsPinned, getPinnedIndex } = column;
  const obj = { width: getSize(), flex: `${getSize()} 0 auto`, minWidth: minSize, position: getIsPinned() ? 'sticky' : 'relative' };

  if (getIsPinned() === 'left') {
    obj.left = `${getStart('left')}px`;
  }
  if (getIsPinned() === 'right') {
    // 获取右固定列右侧总宽度： 分组时无效，获取不到父级的getPinnedIndex;
    const getTotalRight = () => {
      return tableInstance.getRightLeafHeaders().reduce((pre, cur, index) => { return index > getPinnedIndex() ? pre + cur.getSize() : pre }, 0);
    };
    obj.right = `${getTotalRight()}px`;
  }
  if (align) {
    obj.textAlign = align;
  }

  if (maxSize < 2000) {
    obj.maxWidth = maxSize;
  }

  return obj;
}

// 定义固定列的类名
const fixedClassName = ({ getIsPinned, getPinnedIndex, tableInstance }) => {
  // 是否左固定列最后一个
  const getIsLastLeftPinnedColumn = () => {
    if (getIsPinned() !== 'left') return false;
    if (getPinnedIndex() === -1) return true;
    return (
      tableInstance.getLeftLeafHeaders().length - 1 === getPinnedIndex()
    );
  };
  // 是否右固定列第一个
  const getIsFirstRightPinnedColumn = () => {
    if (getIsPinned() !== 'right') return false;
    return getPinnedIndex() === 0;
  };
  return {
    'fixed-left': getIsPinned() === 'left',
    'fixed-left-last': getIsLastLeftPinnedColumn(),
    'fixed-right': getIsPinned() === 'right',
    'fixed-right-first': getIsFirstRightPinnedColumn(),
  }
};

// 表头单元格
export const ckTableHeadCellProps = ({ header, tableInstance }) => {
  const { getSize, getStart, column } = header;
  const { getIsPinned, getPinnedIndex } = { ...column.columnDef, ...column };

  return {
    className: cn("ck-th", fixedClassName({ getIsPinned, getPinnedIndex, tableInstance })),
    style: cellStyle({ ...column.columnDef, ...column, getSize, getStart, tableInstance }),
  }
};

// 表体单元格
export const ckTableBodyCellProps = ({ cell, tableInstance }) => {
  const { column } = cell;
  const { getIsPinned, getPinnedIndex } = { ...column.columnDef, ...column };

  return {
    className: cn("ck-td", fixedClassName({ getIsPinned, getPinnedIndex, tableInstance })),
    style: cellStyle({ ...column.columnDef, ...column, tableInstance }),
  }
}

// 表尾单元格
export const ckTableFooterCellProps = ({ footer, tableInstance }) => {
  const { getSize, getStart, column } = footer;
  const { getIsPinned, getPinnedIndex } = { ...column.columnDef, ...column };

  return {
    className: cn("ck-td", fixedClassName({ getIsPinned, getPinnedIndex, tableInstance })),
    style: cellStyle({ ...column.columnDef, ...column, getSize, getStart, tableInstance }),
  }
};