/* eslint-disable react/no-multi-comp */
/* eslint-disable react/require-default-props */

import React, { Children, Component } from 'react'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import invariant from 'invariant'
import throttle from 'lodash/throttle'
import debounce from 'lodash/debounce'
import resizeDetector from './resizeDetector'

const defaultConfig = {
  monitorWidth: true,
  monitorHeight: false,
  monitorPosition: false,
  refreshRate: 16,
  refreshMode: 'throttle',
  noPlaceholder: false,
  resizeDetectorStrategy: 'scroll',
}

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component'
}

/**
 * This is a utility wrapper component that will allow our higher order
 * component to get a ref handle on our wrapped components html.
 * @see https://gist.github.com/jimfb/32b587ee6177665fb4cf
 */
class ReferenceWrapper extends Component {
  static displayName = 'SizeMeReferenceWrapper'

  render() {
    return Children.only(this.props.children)
  }
}
ReferenceWrapper.propTypes = { children: PropTypes.element.isRequired }

function Placeholder({ className, style }) {
  // Lets create the props for the temp element.
  const phProps = {}

  // We will use any provided className/style or else make the temp
  // container take the full available space.
  if (!className && !style) {
    phProps.style = { width: '100%', height: '100%' }
  } else {
    if (className) {
      phProps.className = className
    }
    if (style) {
      phProps.style = style
    }
  }

  return <div {...phProps} />
}
Placeholder.displayName = 'SizeMePlaceholder'
Placeholder.propTypes = {
  className: PropTypes.string,
  style: PropTypes.object,
}

/**
 * As we need to maintain a ref on the root node that is rendered within our
 * SizeMe component we need to wrap our entire render in a sub component.
 * Without this, we lose the DOM ref after the placeholder is removed from
 * the render and the actual component is rendered.
 * It took me forever to figure this out, so tread extra careful on this one!
 */
const renderWrapper = WrappedComponent => {
  function SizeMeRenderer(props) {
    const {
      explicitRef,
      className,
      style,
      size,
      disablePlaceholder,
      onSize,
      ...restProps
    } = props

    const noSizeData =
      size == null ||
      (size.width == null && size.height == null && size.position == null)

    const renderPlaceholder = noSizeData && !disablePlaceholder

    const renderProps = {
      className,
      style,
    }

    if (size != null) {
      renderProps.size = size
    }

    const toRender = renderPlaceholder ? (
      <Placeholder className={className} style={style} />
    ) : (
      <WrappedComponent {...renderProps} {...restProps} />
    )

    return <ReferenceWrapper ref={explicitRef}>{toRender}</ReferenceWrapper>
  }

  SizeMeRenderer.displayName = `SizeMeRenderer(${getDisplayName(
    WrappedComponent,
  )})`

  SizeMeRenderer.propTypes = {
    explicitRef: PropTypes.func.isRequired,
    className: PropTypes.string,
    style: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    size: PropTypes.shape({
      width: PropTypes.number, // eslint-disable-line react/no-unused-prop-types
      height: PropTypes.number, // eslint-disable-line react/no-unused-prop-types
    }),
    disablePlaceholder: PropTypes.bool,
    onSize: PropTypes.func,
  }

  return SizeMeRenderer
}

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
function sizeMe(config = defaultConfig) {
  const {
    monitorWidth = defaultConfig.monitorWidth,
    monitorHeight = defaultConfig.monitorHeight,
    monitorPosition = defaultConfig.monitorPosition,
    refreshRate = defaultConfig.refreshRate,
    refreshMode = defaultConfig.refreshMode,
    noPlaceholder = defaultConfig.noPlaceholder,
    resizeDetectorStrategy = defaultConfig.resizeDetectorStrategy,
  } = config

  invariant(
    monitorWidth || monitorHeight || monitorPosition,
    'You have to monitor at least one of the width, height, or position when using "sizeMe"',
  )

  invariant(
    refreshRate >= 16,
    "It is highly recommended that you don't put your refreshRate lower than " +
      '16 as this may cause layout thrashing.',
  )

  invariant(
    refreshMode === 'throttle' || refreshMode === 'debounce',
    'The refreshMode should have a value of "throttle" or "debounce"',
  )

  const refreshDelayStrategy = refreshMode === 'throttle' ? throttle : debounce

  return function WrapComponent(WrappedComponent) {
    const SizeMeRenderWrapper = renderWrapper(WrappedComponent)

    class SizeAwareComponent extends React.Component {
      static displayName = `SizeMe(${getDisplayName(WrappedComponent)})`

      static propTypes = {
        onSize: PropTypes.func,
      }

      state = {
        width: undefined,
        height: undefined,
        position: undefined,
      }

      componentDidMount() {
        this.determineStrategy(this.props)
        this.handleDOMNode()
      }

      componentWillReceiveProps(nextProps) {
        this.determineStrategy(nextProps)
      }

      componentDidUpdate() {
        this.handleDOMNode()
      }

      componentWillUnmount() {
        // Change our size checker to a noop just in case we have some
        // late running events.
        this.hasSizeChanged = () => undefined
        this.checkIfSizeChanged = () => undefined

        if (this.domEl) {
          resizeDetector(resizeDetectorStrategy).removeAllListeners(this.domEl)
          this.domEl = null
        }
      }

      determineStrategy = props => {
        if (props.onSize) {
          if (!this.callbackState) {
            this.callbackState = {
              ...this.state,
            }
          }
          this.strategy = 'callback'
        } else {
          this.strategy = 'render'
        }
      }

      strategisedSetState = state => {
        if (this.strategy === 'callback') {
          this.callbackState = state
          this.props.onSize(state)
        } else {
          this.setState(state)
        }
      }

      strategisedGetState = () =>
        this.strategy === 'callback' ? this.callbackState : this.state

      handleDOMNode() {
        const found =
          this.element &&
          // One day this will be deprecated then I will be forced into wrapping
          // the component with a div or such in order to get a dome element handle.
          ReactDOM.findDOMNode(this.element) // eslint-disable-line react/no-find-dom-node

        if (!found) {
          // This is for special cases where the element may be null.
          if (this.domEl) {
            resizeDetector(resizeDetectorStrategy).removeAllListeners(
              this.domEl,
            )
            this.domEl = null
          }
          return
        }

        if (this.domEl) {
          resizeDetector(resizeDetectorStrategy).removeAllListeners(this.domEl)
        }

        this.domEl = found
        resizeDetector(resizeDetectorStrategy).listenTo(
          this.domEl,
          this.checkIfSizeChanged,
        )
      }

      refCallback = element => {
        this.element = element
      }

      hasSizeChanged = (current, next) => {
        const c = current
        const n = next
        const cp = c.position || {}
        const np = n.position || {}

        return (
          (monitorHeight && c.height !== n.height) ||
          (monitorPosition &&
            (cp.top !== np.top ||
              cp.left !== np.left ||
              cp.bottom !== np.bottom ||
              cp.right !== np.right)) ||
          (monitorWidth && c.width !== n.width)
        )
      }

      checkIfSizeChanged = refreshDelayStrategy(el => {
        const {
          width,
          height,
          right,
          left,
          top,
          bottom,
        } = el.getBoundingClientRect()

        const next = {
          width: monitorWidth ? width : null,
          height: monitorHeight ? height : null,
          position: monitorPosition ? { right, left, top, bottom } : null,
        }

        if (this.hasSizeChanged(this.strategisedGetState(), next)) {
          this.strategisedSetState(next)
        }
      }, refreshRate)

      render() {
        const disablePlaceholder =
          sizeMe.enableSSRBehaviour ||
          sizeMe.noPlaceholders ||
          noPlaceholder ||
          this.strategy === 'callback'

        const size = { ...this.state }

        return (
          <SizeMeRenderWrapper
            explicitRef={this.refCallback}
            size={this.strategy === 'callback' ? null : size}
            disablePlaceholder={disablePlaceholder}
            {...this.props}
          />
        )
      }
    }

    SizeAwareComponent.WrappedComponent = WrappedComponent

    return SizeAwareComponent
  }
}

/**
 * Allow SizeMe to run within SSR environments.  This is a "global" behaviour
 * flag that should be set within the initialisation phase of your application.
 *
 * Warning: don't set this flag unless you need to as using it may cause
 * extra render cycles to happen within your components depending on the logic
 * contained within them around the usage of the `size` data.
 *
 * DEPRECATED: Please use the global disablePlaceholders
 */
sizeMe.enableSSRBehaviour = false

/**
 * Global configuration allowing to disable placeholder rendering for all
 * sizeMe components.
 */
sizeMe.noPlaceholders = false

export default sizeMe
