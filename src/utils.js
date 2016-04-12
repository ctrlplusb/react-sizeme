import createResizeDetector from 'element-resize-detector';

export const resizeDetector = createResizeDetector({
  strategy: `scroll`
});

/*
export function throttle({ callback, threshhold, scope }) {
  let last;
  let deferTimer;

  return function throttling(...args) {
    const context = scope || this;
    const now = +new Date;
    if (last && now < last + threshhold) {
      // hold on to it
      clearTimeout(deferTimer);
      deferTimer = setTimeout(function () {
        last = now;
        callback.apply(context, args);
      }, threshhold);
    } else {
      last = now;
      callback.apply(context, args);
    }
  };
}
*/
