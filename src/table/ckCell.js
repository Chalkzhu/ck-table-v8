import React, { useState, useEffect, useRef, useMemo, useContext, useCallback } from 'react';
import { Tooltip } from 'antd';
import Context from '../context';
import { ckTableBodyCellProps } from '../ckTableProps/index.js';

// 提示
const ResetTooltip = ({ title, children, visible }) => {
  const [vis, setVis] = useState();

  const onVisibleChange = (val) => {
    const flag = visible ? val : false;
    setVis(flag);
  };

  return (
    <Tooltip title={title} destroyTooltipOnHide={{ keepParent: false }} visible={vis} onVisibleChange={onVisibleChange}>
      {children}
    </Tooltip>
  )
}

const Cell = ({ cell }) => {
  const { showOverflow } = useContext(Context);
  const ellipsisRef = useRef(null);
  const [isTooltip, setIsTooltip] = useState(false)
  const { column, renderCell, getValue } = cell;
  const { ellipsis } = column.columnDef;

  // title原生提示
  const overflowTitle = useMemo(() => {
    const isHidden = typeof ellipsis === 'boolean' && !ellipsis;
    const showTitle = ellipsis === 'title' || showOverflow === 'title';
    return !isHidden && showTitle;
  }, [ellipsis, showOverflow]);

  // Tooltip提示
  const overflowTooltip = useMemo(() => {
    const isHidden = typeof ellipsis === 'boolean' && !ellipsis;
    const showTooltip = ellipsis === 'tooltip' || showOverflow === 'tooltip';
    return !isHidden && showTooltip;
  }, [ellipsis, showOverflow]);

  // 展示的内容
  const EllipsisValue = useCallback(() => {
    return (
      renderCell?.() || <span title={!overflowTooltip && overflowTitle ? getValue() : null}>{getValue()}</span>
    );
  }, [overflowTooltip, overflowTitle]);

  // 这里的判定有点问题: 当改变幅度较小时无效
  useEffect(() => {
    if (overflowTooltip && ellipsisRef.current) {
      const { scrollWidth, clientWidth } = ellipsisRef.current;
      setIsTooltip(scrollWidth > clientWidth)
    }
  }, [column.getSize()])

  return (
    <ResetTooltip title={renderCell?.() || getValue()} visible={isTooltip}>
      <div ref={ellipsisRef} className="ck-cell">
        <EllipsisValue />
      </div>
    </ResetTooltip>
  )
};

const CellWrapper = ({ cell, tableInstance }) => {

  return (
    <div {...ckTableBodyCellProps({ cell, tableInstance })}>
      <Cell cell={cell} />
    </div>
  );
};

export default CellWrapper;
