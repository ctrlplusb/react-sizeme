import React, { PropTypes } from 'react';
import { merge } from 'lodash';
import randomColor from 'randomcolor';

let SizeMe;

if (process.env.NODE_ENV === `development`) {
  SizeMe = require(`../../src/index.js`).default;
} else {
  SizeMe = require(`react-sizeme`).default;
}

const baseStyle = {
  height: `100px`,
  margin: `10px`,
  fontWeight: `bold`,
  position: `relative`
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
    <div style={merge({}, baseStyle, { backgroundColor: randomColor() }, style)}>
      <span style={spanStyle}>{width}x{height}</span>
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
