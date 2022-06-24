import React, { useContext, useRef, useEffect, useMemo } from 'react';
import cn from 'classnames';
import { useVirtual } from "react-virtual";
import Context from '../context';
import CkRow, { RowVirtual } from './ckRow';

const Body = () => {
  const bodyRef = useRef();
  const { dispatch, state, tableInstance, showOverflow, size = 'small', stripe, rowConfig, enablePagination, virtual } = useContext(Context);
  const { getRowModel, getPaginationRowModel, getPrePaginationRowModel, getTotalSize } = tableInstance;

  // 分页行模型  所有行数据: getRowModel()
  const rows = enablePagination
    ? getPaginationRowModel().rows
    : getPrePaginationRowModel().rows;

  const { totalSize, virtualItems } = useVirtual({
    size: rows.length,
    parentRef: bodyRef,
    estimateSize: React.useCallback(() => {
      const sizes = { large: 64, small: 48, mini: 36 }
      return sizes[size];
    }, [size]),
    overscan: 2
  });

  const onScroll = (e) => {
    const { scrollLeft, scrollWidth, clientWidth } = e.target;
    if (scrollLeft !== state.curScroll.scrollLeft) {
      if (state.headerElem) { state.headerElem.current.scrollLeft = scrollLeft };
      if (state.footerElem) { state.footerElem.current.scrollLeft = scrollLeft };
    }

    dispatch({
      type: 'changeScroll',
      curScroll: { scrollLeft, scrollWidth, clientWidth },
    });
  };

  const virScrollStyles = useMemo(() => {
    return {
      height: `${totalSize}px`,
      width: getTotalSize(),
      position: "relative"
    }
  }, [totalSize, getTotalSize()]);

  useEffect(() => {
    if (bodyRef) {
      dispatch({ type: 'bodyElem', bodyElem: bodyRef });
    };
  }, []);

  return (
    <>
      <div className={cn('ck-body', { ellipsis: !!showOverflow, 'row-hover': rowConfig.isHover, stripe })}>
        <div ref={bodyRef} className='ck-tbody' onScroll={onScroll}>
          <div style={virScrollStyles}>
            {(virtual || rows.length > 50) ? (
              virtualItems.map(({ index, start }) => {
                return <RowVirtual key={rows[index].id} start={start} row={rows[index]} tableInstance={tableInstance} />
              })
            ) : (
              rows.map(row => (
                <CkRow key={row.id} row={row} tableInstance={tableInstance} />
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Body;
