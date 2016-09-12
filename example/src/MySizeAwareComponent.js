import React, { PropTypes } from 'react';

let sizeMe;

if (process.env.NODE_ENV === 'development') {
  sizeMe = require('../../src/sizeMe.js').default;
} else {
  sizeMe = require('react-sizeme').default;
}

const rootStyle = {
  fontWeight: 'bold',
  position: 'relative',
  textAlign: 'center',
};

const spanStyle = {
  position: 'absolute',
  display: 'block',
  top: '50%',
  left: '50%',
  transform: 'translateX(-50%) translateY(-50%)',
};

function MyComponent({ children, size: { width, height }, style }) {
  return (
    <div style={Object.assign({}, rootStyle, style)}>
      <span style={spanStyle}>
        {Math.round(width)}x{Math.round(height)}<br />
        <span style={{ fontWeight: 'normal', fontStyle: 'italic' }}>(rounded)</span>
      </span>
      {children}
    </div>
  );
}

MyComponent.propTypes = {
  children: PropTypes.node,
  size: PropTypes.shape({
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
  }),
  style: PropTypes.object,
};

export default sizeMe({
  monitorHeight: true,
  refreshRate: 2500,
  refreshMode: 'debounce'
})(MyComponent);
