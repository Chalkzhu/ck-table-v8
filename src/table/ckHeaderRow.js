import React from 'react';
import HeaderCell from './ckHeaderCell';

const HeaderRow = ({ headerGroup, tableInstance }) => {
  const { getTotalSize } = tableInstance;

  return (
    <>
      <div
        className="ck-tr"
        style={{ width: getTotalSize(), minWidth: '100%' }}
      >
        {headerGroup.headers.map((header, index) => (
          <HeaderCell
            header={header}
            key={header.id || index}
            tableInstance={tableInstance}
          />
        ))}
      </div>
    </>
  )
};

export default HeaderRow;
