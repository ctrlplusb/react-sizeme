import createResizeDetector from 'element-resize-detector';

const resizeDetector = createResizeDetector({
  strategy: `scroll`
});

export default resizeDetector;
