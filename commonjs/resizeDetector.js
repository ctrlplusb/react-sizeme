'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _elementResizeDetector = require('element-resize-detector');

var _elementResizeDetector2 = _interopRequireDefault(_elementResizeDetector);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var instance = void 0;

// Lazily require to not cause bug
// https://github.com/ctrlplusb/react-sizeme/issues/6
function resizeDetector() {
  if (!instance) {
    instance = (0, _elementResizeDetector2.default)({
      strategy: 'scroll'
    });
  }

  return instance;
}

exports.default = resizeDetector;