
import React, { useState, useMemo, useCallback, useRef } from 'react';
import cn from 'classnames';
import { Input, Checkbox } from 'antd';
import { VirtualList } from '../components/index.js'
import { debounce } from 'lodash';

// 默认过滤器
const DefaultColumnFilter = ({ getFilterValue, setFilterValue }) => {
  const inputRef = useRef(null);

  const onChange = (val) => {
    setFilterValue(val || undefined);
  };

  return (
    <div className="ck-table-filter-dropdown">
      <div className="ck-table-filter-header">
        <Input.Search
          ref={inputRef}
          defaultValue={getFilterValue()}
          allowClear
          size="small"
          placeholder="请输入"
          onSearch={onChange}
        />
      </div>
    </div>
  )
};

// 下拉过滤器
const CheckboxFilter = ({ filters = [], getFilterValue, setFilterValue, onClose }) => {
  const inputRef = useRef(null);
  const [checkedValues, setCheckedValues] = useState(getFilterValue() || []);
  const [options, setOptions] = useState(filters);

  // 是否存在搜索, 当数据大于8时存在搜索
  const isSearch = useMemo(() => filters?.length > 8, [filters.length]);

  // 是否半选
  const indeterminate = useMemo(
    () => checkedValues.length && checkedValues.length < filters.length,
    [checkedValues.length, filters.length],
  );

  // 是否全选
  const checkAll = useMemo(() => checkedValues.length === filters.length, [checkedValues.length, filters.length]);

  // 全选事件
  const onCheckAllChange = () => {
    const nValue = checkAll ? [] : filters.map((v) => v.value);
    setCheckedValues(nValue);
  };

  // 搜索
  const handleFilter = (val) => {
    setOptions(filters.filter((v) => v.label.indexOf(val) > -1));
  };

  // 确定
  const handleSure = () => {
    setFilterValue(checkedValues);
    onClose?.();
  };

  // 清空
  const handleReset = () => {
    inputRef.current.state.value = ''
    setFilterValue(undefined);
    onClose?.();
  };

  // 单选事件
  const onChange = (e, item) => {
    e.preventDefault();
    const arr = checkedValues.includes(item.value)
      ? checkedValues.filter((v) => v !== item.value)
      : [...checkedValues, item.value];
    setCheckedValues(arr || undefined);
    !isSearch && setFilterValue(arr, 'single');
  };

  return (
    <div className="ck-table-filter-dropdown">
      {isSearch && (
        <div className="ck-table-filter-header">
          <Input.Search
            ref={inputRef}
            allowClear
            size="small"
            placeholder="请输入"
            onSearch={handleFilter}
            onChange={debounce((e) => handleFilter(e.target.value), 500)}
          />
          <div className="ck-table-filter-header-operate">
            <Checkbox
              indeterminate={indeterminate}
              onChange={onCheckAllChange}
              checked={checkAll}
              className="filter_tip"
            >
              全部
            </Checkbox>
            <div>
              <span className="filter_tip">已选: {checkedValues.length}</span>
            </div>
          </div>
        </div>
      )}

      <Checkbox.Group value={checkedValues} onChange={onChange} className="ck-table-filter-body">
        <VirtualList options={options} className="ck-table-filter-list">
          {({ item, ...resetProps }) => (
            <div
              {...resetProps}
              className={cn('ck-table-filter-item', { checked: checkedValues.includes(item.value) })}
              onClick={(e) => onChange(e, item)}
            >
              <Checkbox
                value={item.value}
                className="ck-table-filter-item-content"
              >
                {item.label}
              </Checkbox>
            </div>
          )}
        </VirtualList>

        {!options.length && <div className="ck-table-filter-empty">暂无数据</div>}
      </Checkbox.Group>

      {isSearch && (
        <div className="ck-table-filter-footer">
          <div className="footer-save" onClick={handleSure}>确定</div>
          <div className="footer-clear" onClick={handleReset}>清空</div>
        </div>
      )}
    </div>
  )
};

// 下拉过滤器
const SelectColumnFilter = ({ filters = [], getFilterValue, setFilterValue, onClose }) => {
  const inputRef = useRef(null);
  // 搜索后的筛选项
  const [options, setOptions] = useState(filters);

  // 是否存在搜索, 当数据大于8时存在搜索
  const isSearch = useMemo(() => filters?.length > 8, [filters.length]);

  const getIsChecked = useCallback((val) => {
    return val === getFilterValue();
  }, []);

  // 搜索
  const handleFilter = (val) => {
    setOptions(filters.filter((v) => v.label.indexOf(val) > -1));
  };

  // 单选事件
  const onChange = (e, item) => {
    e.preventDefault();
    setFilterValue(getIsChecked(item.value) ? undefined : item.value);
    onClose?.();
  };

  return (
    <div className="ck-table-filter-dropdown">
      {isSearch && (
        <div className="ck-table-filter-header">
          <Input.Search
            ref={inputRef}
            allowClear
            size="small"
            placeholder="请输入"
            onSearch={handleFilter}
            onChange={debounce((e) => handleFilter(e.target.value), 500)}
          />
        </div>
      )}

      <div className="ck-table-filter-body">
        <VirtualList options={options} className="ck-table-filter-list">
          {({ item, ...resetProps }) => {
            return (
              <div
                {...resetProps}
                className={cn('ck-table-filter-item', { checked: getIsChecked(item.value) })}
                onClick={(e) => onChange(e, item)}
              >
                <div className="ck-table-filter-item-content">{item.label}</div>
              </div>
            );
          }}
        </VirtualList>

        {!options.length && <div className="ck-table-filter-empty">暂无数据</div>}
      </div>
    </div>
  )
};

export {
  DefaultColumnFilter,
  CheckboxFilter,
  SelectColumnFilter,
};
