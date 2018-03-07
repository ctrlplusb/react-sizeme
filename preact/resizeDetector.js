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
  var strategy = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'scroll';

  if (!instance) {
    instance = (0, _elementResizeDetector2.default)({
      strategy: strategy
    });
  }

  return instance;
}

exports.default = resizeDetector;