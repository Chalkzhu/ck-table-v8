import React, { useMemo, useRef } from 'react';
import { useVirtual } from 'react-virtual';

const VirList = ({ options = [], children, size = 32, parentRef, className, maxHeight = 224 }) => {
  const bodyRef = useRef(null);

  const { totalSize, virtualItems } = useVirtual({
    size: options.length,
    parentRef: parentRef || bodyRef,
    estimateSize: React.useCallback(() => size, [size]),
    overscan: 2,
  });

  const virScrollStyles = useMemo(
    () => ({ height: `${totalSize}px`, width: '100%', position: 'relative' }),
    [totalSize],
  );

  if (options?.length < 50) {
    return <div className={`virtual_list ${className}`}>{options?.map((item, i) => children({ key: i, item }))}</div>;
  }

  return (
    <>
      <div ref={bodyRef} className={`virtual_list ${className}`} style={{ overflow: 'auto', minWidth: 160, maxHeight }}>
        <div style={virScrollStyles}>
          {virtualItems.map((virtualRow) => {
            const style = {
              position: 'absolute',
              top: 0,
              left: 0,
              minWidth: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            };
            return children({ key: virtualRow.index, item: options[virtualRow.index], style });
          })}
        </div>
      </div>
    </>
  );
};

export default VirList;
