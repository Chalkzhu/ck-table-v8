import React, { forwardRef, useRef, useContext } from 'react';
import Context from '../context';
import { Checkbox } from 'antd';

const GridCheckbox = forwardRef(({ title, ...rest }, ref) => {
  const { checkboxConfig } = useContext(Context);
  const defaultRef = useRef(null);
  const resolvedRef = ref || defaultRef;
  if(checkboxConfig.Control) {
    return <checkboxConfig.Control {...rest} />;
  }

  return <Checkbox ref={resolvedRef} {...rest} />;
});

export default GridCheckbox;
