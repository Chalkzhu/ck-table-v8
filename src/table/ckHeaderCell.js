import React, { useState, useContext, useCallback } from 'react';
import cn from 'classnames';
import { Dropdown } from 'antd';
import Context from '../context';
import { ckTableHeadCellProps } from '../ckTableProps/index.js';

import { DefaultColumnFilter, CheckboxFilter, SelectColumnFilter } from '../filter/select';

const builtInFilterType = {
  text: DefaultColumnFilter,
  checkbox: CheckboxFilter,
  select: SelectColumnFilter
};

// 触发排序
const handleSortChange = async ({ sort, trigger, sortConfig, id, getIsSorted, clearSorting, toggleSorting, sortChange }) => {
  if (!sort) return;
  if (trigger === 'cell' && sortConfig.trigger !== 'cell') return;
  const sortState = getIsSorted();
  await sortState === 'desc' ? clearSorting() : toggleSorting(sortState);
  await sortChange?.({ id, order: getIsSorted() });
};

// 排序
const ColumnSort = (column) => {
  const { sortConfig, sortChange } = useContext(Context);
  const { sort, getIsSorted } = column;
  if (!sort) { return null };

  const sortClick = (e) => {
    e.stopPropagation();
    handleSortChange({ ...column, sortConfig, sortChange });
  };

  return (
    <>
      <div className="ck-column-sorter" onClick={sortClick}>
        <i className={cn('sort-asc', { 'sort-active': getIsSorted() === 'asc' })} />
        <i className={cn('sort-desc', { 'sort-active': getIsSorted() === 'desc' })} />
      </div>
    </>
  )
};

// 过滤
const ColumnFilter = (props) => {
  const { getFilterValue, filterFn, filterRender } = props;
  const { tableInstance: { _render } } = useContext(Context);
  const [visible, setVisible] = useState(false);

  const filterValue = getFilterValue();

  const filterClick = (e) => e.stopPropagation();

  const FilterControl = useCallback(() => {
    return _render(() => filterRender ? filterRender(props) : builtInFilterType[filterFn]({ ...props, onClose: () => setVisible(false) }));
  }, [filterFn, props]);

  return (
    <>
      <div className={cn('ck-column-filter', { 'filter-active': !!filterValue && filterValue.length })} onClick={filterClick}>
        <Dropdown
          trigger={['click']}
          visible={visible}
          placement="bottomRight"
          overlay={FilterControl}
          onVisibleChange={(v) => setVisible(v)}
        >
          <i className="iconfont icon-filter">&#xe8b3;</i>
        </Dropdown>
      </div>
    </>
  )
};

// 拖拽
const ColumnResize = ({ id, getCanResize, getIsResizing, getLeafHeaders, getSize }) => {
  if (!getCanResize()) { return false };
  const { tableInstance } = useContext(Context);
  const { setColumnSizing, setColumnSizingInfo } = tableInstance;
  const [left, setLeft] = useState(0);

  // 移动时获取的clientX - 点击时获取的clientX = 偏移的距离
  const handleResize = () => {
    const onResizeStart = (e) => {
      e.persist();
      e.preventDefault();

      const headerIdWidths = getLeafHeaders().map(d => [d.id, d.getSize()]);

      const dispatchMove = clientXPos => { setLeft(clientXPos - e.clientX) };

      // 拖拽停止,拖拽条状态重置复原
      const dispatchEnd = () => { setLeft(0) };

      const updateOffset = (clientXPos) => {
        let newColumnSizing = {};
        setColumnSizingInfo(old => {
          const deltaOffset = clientXPos - (old?.startOffset ?? 0)
          const deltaPercentage = Math.max(
            deltaOffset / (old?.startSize ?? 0),
            -0.999999
          )

          old.columnSizingStart.forEach(([columnId, headerWidth]) => {
            newColumnSizing[columnId] =
              Math.round(
                Math.max(headerWidth + headerWidth * deltaPercentage, 0) *
                100
              ) / 100
          })

          return {
            ...old,
            deltaOffset,
            deltaPercentage,
            isResizingColumn: false,
          }
        })

        setColumnSizing(old => ({
          ...old,
          ...newColumnSizing,
        }))
      };

      // 监听移动事件，默认鼠标事件mouse，触碰事件touch未加
      const handlersAndEvents = {
        mouse: {
          moveEvent: 'mousemove',
          moveHandler: e => dispatchMove(e.clientX),
          upEvent: 'mouseup',
          upHandler: e => {
            document.removeEventListener(
              'mousemove',
              handlersAndEvents.mouse.moveHandler
            )
            document.removeEventListener(
              'mouseup',
              handlersAndEvents.mouse.upHandler
            )
            updateOffset(e.clientX);

            dispatchEnd();
          },
        },
      };

      document.addEventListener('mousemove',
        handlersAndEvents.mouse.moveHandler,
        false,
      )
      document.addEventListener('mouseup',
        handlersAndEvents.mouse.upHandler,
        false
      )

      setColumnSizingInfo(old => ({
        ...old,
        startOffset: e.clientX,
        startSize: getSize(),
        deltaOffset: 0,
        deltaPercentage: 0,
        columnSizingStart: headerIdWidths,
        isResizingColumn: id,
      }))
    }

    return {
      onClick: (e) => e.stopPropagation(),
      onMouseDown: e => onResizeStart(e),
      style: { transform: `translateX(${left}px)` },
    }
  };

  return (
    <div {...handleResize()} className={cn('ck-table-resize', { isResizing: getIsResizing() })}
    >
      <div className="resize-bar" />
    </div>
  )
};

// 列头单元格拓展区域
const HeaderCellExpand = (props) => {
  const { column } = props;
  const { resizable } = useContext(Context);
  const { sort, filters } = props.column.columnDef;
  const resetColumn = { ...column, ...column.columnDef };

  return (
    <>
      <div className='ck-column-expand'>
        {/* 列排序 */}
        {sort && <ColumnSort {...resetColumn} />}

        {/* 列过滤 */}
        {filters && <ColumnFilter {...resetColumn} />}

        {/* 列拖拽 */}
        {resizable && <ColumnResize {...props} {...resetColumn} />}
      </div>
    </>
  )
};

const HeaderCell = ({ header, tableInstance }) => {
  const { column } = header;
  const { sortConfig, sortChange } = useContext(Context);

  const tableCellProps = () => {
    return {
      ...ckTableHeadCellProps({ header, tableInstance }),
      onClick: () => handleSortChange({ ...column.columnDef, ...column, sortConfig, sortChange, trigger: 'cell' }),
    }
  }

  return (
    <div colSpan={header.colSpan} {...tableCellProps()}>
      <div className="ck-cell">
        {header.renderHeader()}
      </div>

      <HeaderCellExpand {...header} />
    </div>
  );
};

export default HeaderCell;
