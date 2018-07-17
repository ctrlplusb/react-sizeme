import createResizeDetector from 'element-resize-detector'

const instances = {}

// Lazily require to not cause bug
// https://github.com/ctrlplusb/react-sizeme/issues/6
function resizeDetector(strategy = 'scroll') {
  if (!instances[strategy]) {
    instances[strategy] = createResizeDetector({
      strategy,
    })
  }

  return instances[strategy]
}

export default resizeDetector
