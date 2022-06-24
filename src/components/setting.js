import React, { useContext, useMemo } from 'react';
import { Checkbox, Dropdown, Button } from 'antd';
import Context from '../context';
import { swapArr } from '../utils';

const ColumnsList = ({ columns, type, _render }) => {
  const title = useMemo(() => {
    switch (type) {
      case 'left':
        return '固定在左侧'
      case 'center':
        return '不固定'
      case 'right':
        return '固定在右侧'
      default:
        break;
    }
  }, [type])

  return (
    <>
      {columns.length ? <div className="ck-table-setting-item-title">{title}</div> : null}
      {columns.map(({ columnDef, id, getIsVisible, getToggleVisibilityHandler, getIsPinned, pin }) => (
        <div key={id || i} className="ck-table-setting-item">
          <div className="ck-table-setting-draggable">...</div>
          <Checkbox
            checked={getIsVisible()}
            onChange={getToggleVisibilityHandler()} className="ck-table-setting-item-content"
          >
            {columnDef.header ? typeof columnDef.header === 'function' ? _render(() => columnDef.header()) : columnDef.header : null}
          </Checkbox>
          <div className="ck-table-setting-action">
            {getIsPinned() !== 'left' && (
              <div onClick={() => pin('left')} className="action-icon">↑</div>
            )}
            {getIsPinned() && (
              <div onClick={() => pin(false)} className="action-icon">x</div>
            )}
            {getIsPinned() !== 'right' && (
              <div onClick={() => pin('right')} className="action-icon">↓</div>
            )}
          </div>
        </div>
      ))}
    </>
  );
};

const Setting = () => {
  const { tableInstance } = useContext(Context);
  const {
    getLeftHeaderGroups,
    getLeftLeafColumns,
    getCenterLeafColumns,
    getRightLeafColumns,
    getIsAllColumnsVisible,
    getIsSomeColumnsVisible,
    getToggleAllColumnsVisibilityHandler,
    setColumnVisibility,
    setColumnOrder,
    _render,
  } = tableInstance;

  const leftColumns = getLeftLeafColumns().filter(v => !['ck-select'].includes(v.id));
  const columns = [
    ...getLeftLeafColumns(),
    ...getCenterLeafColumns(),
    ...getRightLeafColumns()
  ];

  // 考虑使用标题组展开获取嵌套结构，仅一级结构可固定
  // console.log('getLeftHeaderGroups', getLeftHeaderGroups());

  // 列重置
  const handleReset = () => {
    // 接收默认隐藏的列字段
    const obj = {};
    columns.forEach(({ columnDef: v }) => {
      if (typeof v.visible === 'boolean' && !v.visible) { obj[v.id] = v.visible }
    });
    setColumnVisibility(obj)
  };

  return (
    <div className="ck-table-setting-dropdown">
      <div className="ck-table-setting-header" />
      <div className="ck-table-setting-body">
        <div className="ck-table-setting-reset">
          <Checkbox
            checked={getIsAllColumnsVisible()}
            indeterminate={
              !getIsAllColumnsVisible() && getIsSomeColumnsVisible()
            }
            onChange={getToggleAllColumnsVisibilityHandler()} className="ck-table-setting-item-content"
          >
            全选
          </Checkbox>

          <div>
            <Button type="link" size="small" onClick={handleReset}>
              重置
            </Button>
          </div>
        </div>
        <div className="ck-table-setting-list">
          <ColumnsList columns={leftColumns} type="left" _render={_render} />
          <ColumnsList columns={getCenterLeafColumns()} type="center" _render={_render} />
          <ColumnsList columns={getRightLeafColumns()} type="right" _render={_render} />
        </div>
      </div>
      <div className="ck-table-setting-footer" />
    </div>
  )
};

const Wrapper = () => {
  return (
    <Dropdown trigger="click" placement="bottomRight" overlay={<Setting />}>
      <i className="iconfont icon-setting">&#xe78e;</i>
    </Dropdown>
  )
};

export default Wrapper;