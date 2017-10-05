import createResizeDetector from 'element-resize-detector'

let instance

// Lazily require to not cause bug
// https://github.com/ctrlplusb/react-sizeme/issues/6
function resizeDetector(strategy = 'scroll') {
  if (!instance) {
    instance = createResizeDetector({
      strategy,
    })
  }

  return instance
}

export default resizeDetector
