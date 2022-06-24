import React, { useRef, useContext, useEffect } from 'react';
import Context from '../context';
import { ckTableFooterCellProps } from '../ckTableProps/index.js';

const FooterCell = ({ footer, tableInstance }) => {

  return (
    <div colSpan={footer.colSpan} {...ckTableFooterCellProps({ footer, tableInstance })}>
      <div className='ck-cell'>{footer.renderFooter()}</div>
    </div>
  );
};

const FooterRow = ({ footerGroup, tableInstance }) => {
  const { getTotalSize } = tableInstance;
  return (
    <div className="ck-tr" style={{ width: getTotalSize(), minWidth: '100%' }}>
      {footerGroup.headers.map((footer) => {
        return <FooterCell key={footer.id} footer={footer} tableInstance={tableInstance} />
      })}
    </div>
  )
};

const Footer = () => {
  const tfootRef = useRef(null);
  const { dispatch, tableInstance } = useContext(Context);
  const { getFooterGroups } = tableInstance;

  useEffect(() => {
    if (tfootRef) { dispatch({ type: 'footerElem', footerElem: tfootRef }) }
  }, [])

  return (
    <>
      <div className="ck-footer">
        <div ref={tfootRef} className="ck-tfoot">
          {getFooterGroups().map((footerGroup) => (
            <FooterRow key={footerGroup.id} footerGroup={footerGroup} tableInstance={tableInstance} />
          ))}
        </div>
      </div>
    </>
  );
};

export default Footer;
