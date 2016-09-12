import createResizeDetector from 'element-resize-detector';

let instance;

// Lazily require to not cause bug
// https://github.com/ctrlplusb/react-sizeme/issues/6
// import resizeDetector from './resizeDetector';
function resizeDetector() {
  if (!instance) {
    instance = createResizeDetector({
      strategy: 'scroll',
    });
  }

  return instance;
}

export default resizeDetector;
