import React, { useMemo, useContext } from 'react';
import cn from 'classnames';
import Context from '../context';
import CkCell from './ckCell';

// 未启用虚拟滚动
const Row = ({ row, tableInstance }) => {
  const { checkboxConfig } = useContext(Context);
  const { getTotalSize } = tableInstance;

  const tableRowProps = {
    className: cn('ck-tr', {
      'row-checked': checkboxConfig.highlight && row.getIsSelected()
    }),
    style: { width: getTotalSize(), minWidth: '100%' },
  }

  return (
    <div {...tableRowProps}>
      {row.getVisibleCells().map((cell) => {
        return <CkCell key={cell.id} cell={cell} tableInstance={tableInstance} />
      })}
    </div>
  );
};

// 启用虚拟滚动
const RowVirtual = ({ row, start, tableInstance }) => {
  const { checkboxConfig } = useContext(Context);
  const { getTotalSize } = tableInstance;

  const style = useMemo(() => ({
    position: "absolute",
    top: 0,
    left: 0,
    width: getTotalSize(),
    minWidth: '100%',
    transform: `translateY(${start}px)`,
  }), [start, row, getTotalSize()])

  const tableRowProps = {
    className: cn('ck-tr', {
      'row-checked': checkboxConfig.highlight && row.getIsSelected()
    }),
    style,
  }

  return (
    <div {...tableRowProps}>
      {row.getVisibleCells().map((cell) => {
        return <CkCell key={cell.id} cell={cell} tableInstance={tableInstance} />
      })}
    </div>
  );
};

export default Row;
export { RowVirtual };
