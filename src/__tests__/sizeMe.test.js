/* eslint-disable no-underscore-dangle */
/* eslint-disable global-require */
/* eslint-disable import/no-extraneous-dependencies */

import React from 'react'
import sinon from 'sinon'
import { mount } from 'enzyme'
import { renderToStaticMarkup } from 'react-dom/server'

describe('Given the SizeMe library', () => {
  let sizeMe
  let SizeMeRewireAPI
  let resizeDetectorMock
  const placeholderHtml = '<div style="width: 100%; height: 100%;"></div>'

  const SizeRender = ({ size = {}, debug }) => {
    const { width, height, position } = size
    const p = position || {}
    const result = (
      <div>
        w: {width || 'null'},
        h: {height || 'null'},
        l: {p.left || 'null'},
        r: {p.right || 'null'},
        t: {p.top || 'null'},
        b: {p.bottom || 'null'}
      </div>
    )
    if (debug) {
      console.log(result)
    }
    return result
  }

  const expected = ({ width, height, position }) => {
    const p = position || {}
    return `w: ${width || 'null'}, h: ${height || 'null'}, l: ${p.left || 'null'}, r: ${p.right || 'null'}, t: ${p.top || 'null'}, b: ${p.bottom || 'null'}`
  }

  const delay = (fn, time) =>
    new Promise((resolve, reject) => {
      setTimeout(
        () => {
          try {
            fn()
          } catch (err) {
            reject(err)
          }
          resolve()
        },
        time,
      )
    })

  beforeEach(() => {
    sizeMe = require('../sizeMe').default

    // Set up our mocks.
    SizeMeRewireAPI = sizeMe.__RewireAPI__

    resizeDetectorMock = {
      // :: domEl -> void
      removeAllListeners: sinon.spy(),
      // :: (domeEl, callback) -> void
      listenTo: sinon.spy(),
    }
    SizeMeRewireAPI.__Rewire__('resizeDetector', () => resizeDetectorMock)
  })

  describe('When providing a configuration object', () => {
    describe('And the refresh rate is below 16', () => {
      it('Then an error should be thrown', () => {
        const action = () => sizeMe({ refreshRate: 15 })
        expect(action).toThrow(/don't put your refreshRate lower than 16/)
      })
    })

    describe('And setting an invalid refreshMode to "debounce"', () => {
      it('Then an error should be thrown', () => {
        const action = () => sizeMe({ refreshMode: 'foo' })
        expect(action).toThrow(/refreshMode should have a value of/)
      })
    })

    describe('And both monitor values are set to false', () => {
      it('Then an error should be thrown', () => {
        const action = () =>
          sizeMe({ monitorHeight: false, monitorWidth: false })
        expect(action).toThrow(
          /You have to monitor at least one of the width, height, or position/,
        )
      })
    })
  })

  describe('When disabling placeholders via the component config', () => {
    it('Then the component should render without any size info', () => {
      const SizeAwareComponent = sizeMe({ noPlaceholder: true })(SizeRender)
      const mounted = mount(<SizeAwareComponent />)
      expect(mounted.text()).toEqual(expected({}))
    })
  })

  describe('When disabling placeholders via the global config', () => {
    beforeEach(() => {
      sizeMe.noPlaceholders = true
    })

    afterEach(() => {
      sizeMe.noPlaceholders = false
    })

    it('should not use placeholders when the global config is set', () => {
      const SizeAwareComponent = sizeMe()(SizeRender)
      const mounted = mount(<SizeAwareComponent />)
      expect(mounted.text()).toEqual(expected({}))
    })
  })

  describe('When mounting and unmounting the placeholder component', () => {
    it('Then the resizeDetector registration and deregistration should be called', () => {
      const SizeAwareComponent = sizeMe()(SizeRender)

      const mounted = mount(<SizeAwareComponent />)

      expect(resizeDetectorMock.listenTo.callCount).toEqual(1)
      expect(resizeDetectorMock.removeAllListeners.callCount).toEqual(0)

      mounted.unmount()

      expect(resizeDetectorMock.listenTo.callCount).toEqual(1)
      expect(resizeDetectorMock.removeAllListeners.callCount).toEqual(1)
    })
  })

  describe('When setting the "debounce" refreshMode', () => {
    it('Then the size data should only appear after the refresh rate has expired', () => {
      const config = {
        refreshMode: 'debounce',
        refreshRate: 50,
        monitorHeight: true,
      }
      const SizeAwareComponent = sizeMe(config)(SizeRender)

      const mounted = mount(<SizeAwareComponent />)

      // Get the callback for size changes.
      const { listenTo } = resizeDetectorMock
      const checkIfSizeChangedCallback = listenTo.args[0][1]
      checkIfSizeChangedCallback({
        getBoundingClientRect: () => ({
          width: 100,
          height: 50,
        }),
      })

      return Promise.all([
        delay(() => expect(mounted.text()).toEqual(''), 25),
        delay(
          () =>
            expect(mounted.text()).toEqual(
              expected({ width: 100, height: 50 }),
            ),
          60,
        ),
      ])
    })
  })

  describe('When the wrapped component gets mounted after the placeholder', () => {
    it('Then the resizeDetector registration and deregistration should be called', () => {
      const config = { monitorHeight: true }
      const SizeAwareComponent = sizeMe(config)(SizeRender)

      const mounted = mount(<SizeAwareComponent />)

      // An add listener should have been called for the placeholder.
      expect(resizeDetectorMock.listenTo.callCount).toEqual(1)
      expect(resizeDetectorMock.removeAllListeners.callCount).toEqual(0)

      // Get the callback for size changes.
      const checkIfSizeChangedCallback = resizeDetectorMock.listenTo.args[0][1]
      checkIfSizeChangedCallback({
        getBoundingClientRect: () => ({
          width: 100,
          height: 50,
        }),
      })

      // Our actual component should have mounted, therefore a removelistener
      // should have been called on the placeholder, and an add listener
      // on the newly mounted component.
      expect(mounted.text()).toEqual(expected({ width: 100, height: 50 }))
      expect(resizeDetectorMock.listenTo.callCount).toEqual(2)
      expect(resizeDetectorMock.removeAllListeners.callCount).toEqual(1)

      // umount
      mounted.unmount()

      // The remove listener should have been called!
      expect(resizeDetectorMock.listenTo.callCount).toEqual(2)
      expect(resizeDetectorMock.removeAllListeners.callCount).toEqual(2)
    })
  })

  describe('When no className or style has been provided', () => {
    it('Then it should render the default placeholder', () => {
      const SizeAwareComponent = sizeMe()(SizeRender)
      const mounted = mount(<SizeAwareComponent />)
      expect(mounted.html()).toEqual(placeholderHtml)
    })
  })

  describe('When only a className has been provided', () => {
    it('Then it should render a placeholder with the className', () => {
      const SizeAwareComponent = sizeMe()(SizeRender)
      const mounted = mount(<SizeAwareComponent className={'foo'} />)
      expect(mounted.html()).toEqual('<div class="foo"></div>')
    })
  })

  describe('When only a style has been provided', () => {
    it('Then it should render a placeholder with the style', () => {
      const SizeAwareComponent = sizeMe()(SizeRender)
      const mounted = mount(<SizeAwareComponent style={{ height: '20px' }} />)
      expect(mounted.html()).toEqual('<div style="height: 20px;"></div>')
    })
  })

  describe('When a className and style have been provided', () => {
    it('Then it should render a placeholder with both', () => {
      const SizeAwareComponent = sizeMe()(SizeRender)
      const mounted = mount(
        <SizeAwareComponent style={{ height: '20px' }} className={'foo'} />,
      )
      expect(mounted.html()).toEqual(
        '<div class="foo" style="height: 20px;"></div>',
      )
    })
  })

  describe('When the size event has occurred when only width is being monitored', () => {
    it('Then expected sizes should be provided to the rendered component', () => {
      const SizeAwareComponent = sizeMe({
        monitorWidth: true,
        monitorHeight: false,
      })(SizeRender)

      const mounted = mount(<SizeAwareComponent />)

      // Initial render should be as expected.
      expect(mounted.html()).toEqual(placeholderHtml)

      // Get the callback for size changes.
      const checkIfSizeChangedCallback = resizeDetectorMock.listenTo.args[0][1]
      checkIfSizeChangedCallback({
        getBoundingClientRect: () => ({ width: 100, height: 150 }),
      })

      // Update should have occurred immediately.
      expect(mounted.text()).toEqual(expected({ width: 100 }))
    })
  })

  describe('When the size event has occurred when only height is being monitored', () => {
    it('Then expected sizes should be provided to the rendered component', () => {
      const SizeAwareComponent = sizeMe({
        monitorWidth: false,
        monitorHeight: true,
      })(SizeRender)

      const mounted = mount(<SizeAwareComponent />)

      // Initial render should be as expected.
      expect(mounted.html()).toEqual(placeholderHtml)

      // Get the callback for size changes.
      const checkIfSizeChangedCallback = resizeDetectorMock.listenTo.args[0][1]
      checkIfSizeChangedCallback({
        getBoundingClientRect: () => ({ width: 100, height: 150 }),
      })

      // Update should have occurred immediately.
      expect(mounted.text()).toEqual(expected({ height: 150 }))
    })
  })

  describe('When the size event has occurred when only position is being monitored', () => {
    it('Then expected position should be provided to the rendered component', () => {
      const SizeAwareComponent = sizeMe({
        monitorWidth: false,
        monitorHeight: false,
        monitorPosition: true,
      })(SizeRender)

      const mounted = mount(<SizeAwareComponent />)

      // Initial render should be as expected.
      expect(mounted.html()).toEqual(placeholderHtml)

      // Get the callback for size changes.
      const checkIfSizeChangedCallback = resizeDetectorMock.listenTo.args[0][1]
      checkIfSizeChangedCallback({
        getBoundingClientRect: () => ({
          width: 100,
          height: 150,
          left: 55,
          right: 66,
          top: 77,
          bottom: 88,
        }),
      })

      // Update should have occurred immediately.
      expect(mounted.text()).toEqual(
        expected({ position: { left: 55, right: 66, top: 77, bottom: 88 } }),
      )
    })
  })

  describe('When the size event has occurred when width and height are being monitored', () => {
    it('Then expected sizes should be provided to the rendered component', () => {
      const SizeAwareComponent = sizeMe({
        monitorWidth: true,
        monitorHeight: true,
      })(SizeRender)

      const mounted = mount(<SizeAwareComponent />)

      // Initial render should be as expected.
      expect(mounted.html()).toEqual(placeholderHtml)

      // Get the callback for size changes.
      const checkIfSizeChangedCallback = resizeDetectorMock.listenTo.args[0][1]
      checkIfSizeChangedCallback({
        getBoundingClientRect: () => ({ width: 100, height: 150 }),
      })

      // Update should have occurred immediately.
      expect(mounted.text()).toEqual(expected({ height: 150, width: 100 }))
    })
  })

  describe('When it receives new non-size props', () => {
    it('Then the new props should be passed into the component', () => {
      const SizeAwareComponent = sizeMe({
        monitorHeight: true,
        monitorWidth: true,
        monitorPos: true,
      })(({ otherProp }) => <div>{otherProp}</div>)

      const mounted = mount(<SizeAwareComponent otherProp="foo" />)

      // Get the callback for size changes.
      const checkIfSizeChangedCallback = resizeDetectorMock.listenTo.args[0][1]
      checkIfSizeChangedCallback({
        getBoundingClientRect: () => ({
          width: 100,
          height: 100,
          left: 55,
          right: 66,
          top: 77,
          bottom: 88,
        }),
      })

      expect(mounted.text()).toEqual('foo')
      mounted.setProps({ otherProp: 'bar' })
      expect(mounted.text()).toEqual('bar')
    })
  })

  describe('When running is SSR mode', () => {
    beforeEach(() => {
      sizeMe.enableSSRBehaviour = true
    })

    it('Then it should render the wrapped rather than the placeholder', () => {
      const SizeAwareComponent = sizeMe({
        monitorHeight: true,
        monitorWidth: true,
      })(SizeRender)

      const actual = renderToStaticMarkup(
        <SizeAwareComponent otherProp="foo" />,
      )

      expect(actual).toContain(expected({}))
    })
  })
})
