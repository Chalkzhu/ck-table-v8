import React, { useContext, useEffect, useRef } from 'react';
import Context from '../context';
import HeaderRow from './ckHeaderRow';

// 列头
const Header = () => {
  const theadRef = useRef(null);
  const { dispatch, tableInstance } = useContext(Context);
  const { getHeaderGroups } = tableInstance;

  useEffect(() => {
    if (theadRef) { dispatch({ type: 'headerElem', headerElem: theadRef }) }
  }, []);

  return (
    <>
      <div className="ck-header">
        <div ref={theadRef} className="ck-thead">
          {getHeaderGroups().map((headerGroup) => (
            <HeaderRow key={headerGroup.id} headerGroup={headerGroup} tableInstance={tableInstance} />
          ))}
        </div>
      </div>
    </>
  );
};

export default Header;
