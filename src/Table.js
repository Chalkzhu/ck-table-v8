import React, { useState, useReducer, useMemo, forwardRef, useImperativeHandle } from 'react';
import {
  createTable,
  useTableInstance,
  getExpandedRowModel,
  getGroupedRowModel,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getFacetedRowModel,
  getPaginationRowModel
} from '@tanstack/react-table';

import cn from 'classnames';
import Context from './context';

import Header from './table/ckHeader';
import Body from './table/ckBody';
import Footer from './table/ckFooter';
import { getAllLeafColumnDefs, createDisplayColumn, createGroup, createDataColumn } from './utils';
import IndeterminateCheckbox from './components/Checkbox.js';

import Set from './components/setting';

// Reducer状态配置
const reducerState = {
  rowHeight: 0, // 行的高度
  totalLen: 0, // 总行数
  curScroll: {
    scrollLeft: 0,
    scrollTop: 0,
  },
  headerElem: null,
  bodyElem: null,
  footerElem: null,
};

const reducer = (state, action) => {
  const { curScroll, headerElem, bodyElem, footerElem } = action;

  switch (action.type) {
    case 'changeScroll':
      return {
        ...state,
        curScroll,
      };
    case 'headerElem':
      return {
        ...state,
        headerElem,
      };
    case 'bodyElem':
      return {
        ...state,
        bodyElem,
      };
    case 'footerElem':
      return {
        ...state,
        footerElem,
      };
    default:
      throw new Error();
  }
};

let table = createTable();

const Table = forwardRef((props, ref) => {
  const { data, columns, initialState = {}, height = '100%', showFooter, size = 'small', border = 'full' } = props;
  // 初始化状态（用于缓存本地结构化）
  const [state, dispatch] = useReducer(reducer, reducerState);

  // 表格基础配置
  const initConfig = useMemo(() => {
    const { toolbar, rowConfig, columnConfig, checkboxConfig, sortConfig, editConfig, virtualConfig } = props;
    return {
      toolbar: { ...toolbar }, // 功能区域配置
      rowConfig: { isHover: false, ...rowConfig }, // 行配置
      sortConfig: { trigger: 'default', remote: false, ...sortConfig }, // 排序配置
      columnConfig: { ...columnConfig }, // 列配置
      checkboxConfig: { Control: null, ...checkboxConfig }, // 复选框配置
      editConfig: { enabled: false, autoSave: false, ...editConfig }, // 编辑配置
      virtualConfig: { enabled: true, ...virtualConfig }, // 虚拟滚动配置
    }
  }, []);

  const filterFns = useMemo(() => {
    return {
      select: (row, id, filterValue) => {
        const rowValue = row.values[id]
        return rowValue !== undefined
          ? String(rowValue)
            .toLowerCase()
            .includes(String(filterValue).toLowerCase())
          : true
      },
      checkbox: (row, id, filterValue) => {
        const rowValue = row.original[id]
        return (!!rowValue && filterValue.length)
          ? filterValue.includes(rowValue)
          : true
      },
      text: (row, id, filterValue) => {
        const rowValue = row.values[id]
        return rowValue !== undefined
          ? String(rowValue)
            .toLowerCase()
            .startsWith(String(filterValue).toLowerCase())
          : true
      },
    }
  });

  // 初始化当前缓存
  const [currentFilterFns, setCurrentFilterFns] = useState(() =>
    Object.assign(
      {},
      ...getAllLeafColumnDefs(props.columns).map((c) => ({
        [c.id]:
          c.filterFn ??
          initialState?.currentFilterFns?.[c.id] ??
          (!!c.filterSelectOptions?.length ? 'select' : 'text'),
      })),
    ),
  );

  // 添加默认首尾列
  const [leadingDisplayColumns, trailingDisplayColumns] = useMemo(() => {
    // 前置列
    const leadingDisplayColumns = [
      props.enableRowSelection &&
      createDisplayColumn(table, {
        header: ({ instance }) => {
          return (
            <IndeterminateCheckbox {...{
              checked: instance.getIsAllRowsSelected(),
              indeterminate: instance.getIsSomeRowsSelected(),
              onChange: instance.getToggleAllRowsSelectedHandler(),
            }} />
          )
        },
        cell: ({ row }) => {
          return (
            <IndeterminateCheckbox {...{
              checked: row.getIsSelected(),
              indeterminate: row.getIsSomeSelected(),
              onChange: row.getToggleSelectedHandler(),
            }} />
          )
        },
        fixed: 'left',
        id: 'ck-select',
        size: 60,
      })
    ].filter(Boolean);

    // 后置列
    const trailingDisplayColumns = [];

    return [leadingDisplayColumns, trailingDisplayColumns];
  }, [])

  // 重置列
  const resetColumns = useMemo(
    () => [
      ...leadingDisplayColumns,
      ...props.columns.map((column) =>
        column.columns
          ? createGroup(table, column, currentFilterFns)
          : createDataColumn(table, column, currentFilterFns),
      ),
      ...trailingDisplayColumns,
    ],
    [table, props.columns, currentFilterFns, leadingDisplayColumns],
  );

  const tableInstance = useTableInstance(table,
    {
      filterFns,
      data,
      columns: resetColumns,
      initialState: {
        columnPinning: {
          // ['ck-select', 'ck-expand', 'ck-seq']
          left: ['ck-select'],
          right: [],
        }
      },
      defaultColumn: { size: 150, minSize: 60, filterFn: 'checkbox', visible: true, header: false, cell: false },
      getCoreRowModel: getCoreRowModel(),
      getExpandedRowModel: getExpandedRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getGroupedRowModel: getGroupedRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      getFacetedRowModel: getFacetedRowModel(),
      columnResizeMode: 'onEnd',
    },
  );
  // 状态可控管理
  const [optionsState, setOptionsState] = useState(tableInstance.initialState);
  tableInstance.setOptions(prev => ({
    ...prev,
    state: optionsState,
    onStateChange: setOptionsState,
  }))

  // console.log('所选状态：', optionsState);

  // 向外暴露事件
  useImperativeHandle(ref, () => ({
    getCheckboxRecords: tableInstance.getSelectedRowModel().flatRows.map(v => v.original),
    getInstance: () => tableInstance,
  }));

  return (
    <Context.Provider value={{ dispatch, state, tableInstance, ...props, ...initConfig }}>
      <div className={cn('ck-table', size, `border-${border}`)} style={{ height }}>
        <Set />
        <Header />
        <Body />
        {showFooter && <Footer />}
      </div>
      {/* <pre>{JSON.stringify(tableInstance.getState(), null, 2)}</pre> */}
    </Context.Provider>
  );
});

export default Table;
