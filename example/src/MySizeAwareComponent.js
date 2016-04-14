import React, { PropTypes } from 'react';
import { merge } from 'lodash';

let SizeMe;

if (process.env.NODE_ENV === `development`) {
  SizeMe = require(`../../src/index.js`).default;
} else {
  SizeMe = require(`react-sizeme`).default;
}

const rootStyle = {
  fontWeight: `bold`,
  position: `relative`,
  textAlign: `center`
};

const spanStyle = {
  position: `absolute`,
  display: `block`,
  top: `50%`,
  left: `50%`,
  transform: `translateX(-50%) translateY(-50%)`
};

function MyComponent({ size: { width, height }, style }) {
  return (
    <div style={merge({}, rootStyle, style)}>
      <span style={spanStyle}>
        {Math.round(width)}x{Math.round(height)}<br />
      <span style={{ fontWeight: `normal`, fontStyle: `italic` }}>(rounded)</span>
      </span>
    </div>
  );
}
MyComponent.propTypes = {
  size: PropTypes.shape({
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
  }),
  style: PropTypes.object
};

export default SizeMe()(MyComponent);
