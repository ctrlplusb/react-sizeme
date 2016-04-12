/* eslint-disable react/no-multi-comp */

import React, { Children, Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import invariant from 'invariant';
import { resizeDetector } from './utils';
import { debounce, throttle } from 'lodash';

const defaultConfig = {
  monitorWidth: true,
  monitorHeight: false
};

/**
 * This is a utility wrapper component that will allow our higher order
 * component to handle stateless component inputs.
 *
 * This is required as you can not obtain a ref on a stateless component.
 *
 * @see https://gist.github.com/jimfb/32b587ee6177665fb4cf
 */
class SizeAwareStatelessWrapper extends Component {
  render() {
    return Children.only(this.props.children);
  }
}
SizeAwareStatelessWrapper.propTypes = {
  children: PropTypes.any.isRequired
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
    class SizeAwareComponent extends Component {
      state = {
        height: undefined,
        width: undefined
      };

      shouldComponentUpdate(nextProps, nextState) {
        return this._hasSizeChanged(this.state, nextState);
      }

      componentWillUnmount() {
        if (this.domEl) {
          resizeDetector.removeAllListeners(this.domEl);
        }
      }

      _handleInitialRenderCallback = (rendererChild) => {
        if (!rendererChild) return;

        this._checkIfSizeChanged(rendererChild);
      }

      _handleRenderCallback = (renderedChild) => {
        if (!renderedChild) return;

        const domEl = ReactDOM.findDOMNode(renderedChild);
        this._mountResizeListener(domEl);
      }

      _mountResizeListener(newDomEl) {
        if (!newDomEl) {
          // Incoming DOM el is null, ignoring.
          return;
        }

        if (this.domEl && this.domEl === newDomEl) {
          // Tracked dom el hasn't changed.
          return;
        }

        if (this.domEl) {
          resizeDetector.removeAllListeners(this.domEl);
        }

        this.domEl = newDomEl;
        resizeDetector.listenTo(this.domEl, this._checkIfSizeChanged);
      }

      _hasSizeChanged(current, next) {
        const { height: cHeight, width: cWidth } = current;
        const { height: nHeight, width: nWidth } = next;

        return (monitorHeight && cHeight !== nHeight)
          || (monitorWidth && cWidth !== nWidth);
      }

      _checkIfSizeChanged = debounce(throttle((el) => {
        const { width, height } = el.getBoundingClientRect();
        const next = { width, height };

        if (this._hasSizeChanged(this.state, next)) {
          this.setState(next);
        }
      }, refreshRate), refreshRate)

      render() {
        const { width, height } = this.state;
        const { className, style } = this.props;

        if (!width && !height) {
          // We need to create a temp element in order to calculate the
          // initial size.

          // Lets create the props for the temp element.
          const props = {
            ref: this._handleInitialRenderCallback
          };

          // We will use any provided className or else make the temp
          // container take the full available space.
          if (className) {
            props.className = className;
          } else if (style) {
            props.style = style;
          } else {
            props.style = { width: `100%`, height: `100%`, position: `relative` };
          }

          return <div {...props} />;
        }

        return (
          <SizeAwareStatelessWrapper ref={this._handleRenderCallback}>
            <WrappedComponent
              size={this.state}
              {...this.props}
            />
          </SizeAwareStatelessWrapper>
        );
      }
    }

    SizeAwareComponent.propTypes = {
      className: PropTypes.string,
      style: PropTypes.object
    };

    return SizeAwareComponent;
  };
}

export default SizeMe;
