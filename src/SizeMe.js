/* eslint-disable react/no-multi-comp */

import React, { Children, Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import invariant from 'invariant';
import { throttle } from 'lodash';
import resizeDetector from './resizeDetector';

const defaultConfig = {
  monitorWidth: true,
  monitorHeight: false
};

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || `Component`;
}

/**
 * This is a utility wrapper component that will allow our higher order
 * component to get a ref handle on our wrapped components html.
 * @see https://gist.github.com/jimfb/32b587ee6177665fb4cf
 */
class ReferenceWrapper extends Component {
  static displayName = `SizeMeReferenceWrapper`;

  render() {
    return Children.only(this.props.children);
  }
}
ReferenceWrapper.propTypes = { children: PropTypes.element.isRequired };

function Placeholder({ className, style }) {
  // Lets create the props for the temp element.
  const phProps = {};

  // We will use any provided className/style or else make the temp
  // container take the full available space.
  if (!className && !style) {
    phProps.style = {
      width: `100%`, height: `100%`, position: `relative`
    };
  } else {
    if (className) {
      phProps.className = className;
    }
    if (style) {
      phProps.style = style;
    }
  }

  return (<div {...phProps}></div>);
}
Placeholder.displayName = `SizeMePlaceholder`;
Placeholder.propTypes = {
  className: PropTypes.string,
  style: PropTypes.object
};

/**
 * As we need to maintain a ref on the root node that is rendered within our
 * SizeMe component we need to wrap our entire render in a sub component.
 * Without this, we lose the DOM ref after the placeholder is removed from
 * the render and the actual component is rendered.
 * It took me forever to figure this out, so tread extra careful on this one!
 */
const RenderWrapper = (WrappedComponent) => {
  function SizeMeRenderer({ explicitRef, className, style, size, ...restProps }) {
    const { width, height } = size;

    const toRender = (width === undefined && height === undefined)
      ? <Placeholder className={className} style={style} />
    : <WrappedComponent className={className} style={style} size={size} {...restProps} />;

    return (
      <ReferenceWrapper ref={explicitRef}>
        {toRender}
      </ReferenceWrapper>
    );
  }

  SizeMeRenderer.displayName = `SizeMeRenderer(${getDisplayName(WrappedComponent)})`;

  SizeMeRenderer.propTypes = {
    explicitRef: PropTypes.func.isRequired,
    className: PropTypes.string,
    style: PropTypes.object,
    size: PropTypes.shape({
      width: PropTypes.number,
      height: PropTypes.number
    })
  };

  return SizeMeRenderer;
};

/**
 * :: config -> Component -> WrappedComponent
 *
 * Higher order component that allows the wrapped component to become aware
 * of it's size, by receiving it as an object within it's props.
 *
 * @param  monitorWidth
 *   Default true, whether changes in the element's width should be monitored,
 *   causing a size property to be broadcast.
 * @param  monitorHeight
 *   Default false, whether changes in the element's height should be monitored,
 *   causing a size property to be broadcast.
 *
 * @return The wrapped component.
 */
function SizeMe(config = defaultConfig) {
  const { monitorWidth = true, monitorHeight = false, refreshRate = 16 } = config;

  invariant(
    monitorWidth || monitorHeight,
    `You have to monitor at least one of the width or height when using the ` +
    `"sizeAware" higher order component`);

  invariant(
    refreshRate >= 16,
    `It is highly recommended that you don't put your refreshRate lower than ` +
    `16 as this may cause layout thrashing.`
  );

  return function WrapComponent(WrappedComponent) {
    const SizeMeRenderWrapper = RenderWrapper(WrappedComponent);

    class SizeAwareComponent extends React.Component {
      static displayName = `SizeMe(${getDisplayName(WrappedComponent)})`;

      state = {
        width: undefined,
        height: undefined
      };

      componentDidMount() {
        this.handleDOMNode();
      }

      componentDidUpdate() {
        this.handleDOMNode();
      }

      componentWillUnmount() {
        // Change our size checker to a noop just in case we have some
        // late running events.
        this.hasSizeChanged = () => undefined;
        this.checkIfSizeChanged = () => undefined;

        if (this.domEl) {
          resizeDetector.removeAllListeners(this.domEl);
          this.domEl = null;
        }
      }

      handleDOMNode() {
        const found = this.element &&
          ReactDOM.findDOMNode(this.element);

        /* istanbul ignore next */
        if (!found) {
          // This is for special cases where the element may be null.
          if (this.domEl) {
            resizeDetector.removeAllListeners(this.domEl);
            this.domEl = null;
          }
          return;
        }

        if (this.domEl) {
          resizeDetector.removeAllListeners(this.domEl);
        }

        this.domEl = found;
        resizeDetector.listenTo(this.domEl, this.checkIfSizeChanged);
      }

      refCallback = (element) => {
        this.element = element;
      }

      hasSizeChanged = (current, next) => {
        const { height: cHeight, width: cWidth } = current;
        const { height: nHeight, width: nWidth } = next;

        return (monitorHeight && cHeight !== nHeight)
          || (monitorWidth && cWidth !== nWidth);
      };

      checkIfSizeChanged = throttle((el) => {
        const { width, height } = el.getBoundingClientRect();
        const next = {
          width: monitorWidth ? width : null,
          height: monitorHeight ? height : null
        };

        if (this.hasSizeChanged(this.state, next)) {
          this.setState(next);
        }
      }, refreshRate);

      render() {
        const { width, height } = this.state;

        return (
          <SizeMeRenderWrapper
            explicitRef={this.refCallback}
            size={{ width, height }}
            {...this.props}
          />
        );
      }
    }

    return SizeAwareComponent;
  };
}

export default SizeMe;
