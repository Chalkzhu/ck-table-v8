import React, { useState } from 'react';
import { Input } from 'antd';

const EditCellText = ({ cell, tableInstance }) => {
  const {
    getState,
    options: { onCellEditBlur, onCellEditChange }, setCurrentEditingCell,
    setCurrentEditingRow
  } = tableInstance;
  const [value, setValue] = useState(() => cell.getValue());
  const { column, row } = cell;

  // 失焦事件
  const handleBlur = (event) => {
    if (getState().currentEditingRow) {
      row._valuesCache[column.id] = value;
      setCurrentEditingRow({ ...getState().currentEditingRow });
    }
    setCurrentEditingCell(null);
    column.onCellEditBlur?.({ event, cell, tableInstance });
    onCellEditBlur?.({ event, cell, tableInstance });
  };

  // 值改变事件
  const handleChange = (event) => {
    setValue(event.target.value)
    column.onCellEditChange?.({ event, cell, tableInstance });
    onCellEditChange?.({ event, cell, tableInstance });
  };

  return (
    <>
      <Input
        placeholder="请输入"
        {...column.editEnum}
        value={value}
        onBlur={handleBlur}
        onChange={handleChange}
      />
    </>
  )
};

export default EditCellText;
