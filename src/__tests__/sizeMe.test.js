/* eslint-disable no-underscore-dangle */
/* eslint-disable global-require */
/* eslint-disable import/no-extraneous-dependencies */

import React from 'react'
import sinon from 'sinon'
import { mount } from 'enzyme'
import { renderToString } from 'react-dom/server'

describe('Given the SizeMe library', () => {
  let sizeMe
  let SizeMeRewireAPI
  let resizeDetectorMock
  const placeholderHtml = '<div style="width: 100%; height: 100%;"></div>'

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
          /You have to monitor at least one of the width or height/,
        )
      })
    })
  })

  describe('When mounting and unmounting the placeholder component', () => {
    it('Then the resizeDetector registration and deregistration should be called', () => {
      const SizeAwareComponent = sizeMe()(() => <div />)

      const mounted = mount(<SizeAwareComponent />)

      expect(resizeDetectorMock.listenTo.callCount).toEqual(1)
      expect(resizeDetectorMock.removeAllListeners.callCount).toEqual(0)

      mounted.unmount()

      expect(resizeDetectorMock.listenTo.callCount).toEqual(1)
      expect(resizeDetectorMock.removeAllListeners.callCount).toEqual(1)
    })
  })

  describe('When setting the "debounce" refreshMode', () => {
    it('Then the size data should only appear after the refresh rate has expired', (done) => {
      const config = {
        refreshMode: 'debounce',
        refreshRate: 50,
        monitorHeight: true,
      }
      const SizeAwareComponent = sizeMe(config)(({
        size: { width, height },
      }) => <div>{width} x {height}</div>)

      const mounted = mount(<SizeAwareComponent />)

      // Get the callback for size changes.
      const checkIfSizeChangedCallback = resizeDetectorMock.listenTo.args[0][1]
      checkIfSizeChangedCallback({
        getBoundingClientRect: () => ({
          width: 100,
          height: 100,
        }),
      })

      setTimeout(() => expect(mounted.text()).toEqual(''), 25)
      setTimeout(
        () => {
          expect(mounted.text()).toEqual('100 x 100')
          done()
        },
        55,
      )
    })
  })

  describe('When the wrapped component gets mounted after the placeholder', () => {
    it('Then the resizeDetector registration and deregistration should be called', () => {
      const config = { monitorHeight: true }
      const SizeAwareComponent = sizeMe(config)(({
        size: { width, height },
      }) => <div>{width} x {height}</div>)

      const mounted = mount(<SizeAwareComponent />)

      // An add listener should have been called for the placeholder.
      expect(resizeDetectorMock.listenTo.callCount).toEqual(1)
      expect(resizeDetectorMock.removeAllListeners.callCount).toEqual(0)

      // Get the callback for size changes.
      const checkIfSizeChangedCallback = resizeDetectorMock.listenTo.args[0][1]
      checkIfSizeChangedCallback({
        getBoundingClientRect: () => ({
          width: 100,
          height: 100,
        }),
      })

      // Our actual component should have mounted, therefore a removelistener
      // should have been called on the placeholder, and an add listener
      // on the newly mounted component.
      expect(mounted.text()).toEqual('100 x 100')
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
      const SizeAwareComponent = sizeMe()(() => <div />)

      const mounted = mount(<SizeAwareComponent />)

      expect(mounted.html()).toEqual(placeholderHtml)
    })
  })

  describe('When only a className has been provided', () => {
    it('Then it should render a placeholder with the className', () => {
      const SizeAwareComponent = sizeMe()(() => <div />)

      const mounted = mount(<SizeAwareComponent className={'foo'} />)

      expect(mounted.html()).toEqual('<div class="foo"></div>')
    })
  })

  describe('When only a style has been provided', () => {
    it('Then it should render a placeholder with the style', () => {
      const SizeAwareComponent = sizeMe()(() => <div />)

      const mounted = mount(<SizeAwareComponent style={{ height: '20px' }} />)

      expect(mounted.html()).toEqual('<div style="height: 20px;"></div>')
    })
  })

  describe('When a className and style have been provided', () => {
    it('Then it should render a placeholder with both', () => {
      const SizeAwareComponent = sizeMe()(() => <div />)

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
      })(({ size: { width, height } }) => (
        <div>{width} x {height || 'null'}</div>
      ))

      const mounted = mount(<SizeAwareComponent />)

      // Initial render should be as expected.
      expect(mounted.html()).toEqual(placeholderHtml)

      // Get the callback for size changes.
      const checkIfSizeChangedCallback = resizeDetectorMock.listenTo.args[0][1]
      checkIfSizeChangedCallback({
        getBoundingClientRect: () => ({ width: 100, height: 150 }),
      })

      // Update should have occurred immediately.
      expect(mounted.text()).toEqual('100 x null')
    })
  })

  describe('When the size event has occurred when only height is being monitored', () => {
    it('Then expected sizes should be provided to the rendered component', () => {
      const SizeAwareComponent = sizeMe({
        monitorWidth: false,
        monitorHeight: true,
      })(({ size: { width, height } }) => (
        <div>{width || 'null'} x {height}</div>
      ))

      const mounted = mount(<SizeAwareComponent />)

      // Initial render should be as expected.
      expect(mounted.html()).toEqual(placeholderHtml)

      // Get the callback for size changes.
      const checkIfSizeChangedCallback = resizeDetectorMock.listenTo.args[0][1]
      checkIfSizeChangedCallback({
        getBoundingClientRect: () => ({ width: 100, height: 150 }),
      })

      // Update should have occurred immediately.
      expect(mounted.text()).toEqual('null x 150')
    })
  })

  describe('When the size event has occurred when width and height are being monitored', () => {
    it('Then expected sizes should be provided to the rendered component', () => {
      const SizeAwareComponent = sizeMe({
        monitorWidth: true,
        monitorHeight: true,
      })(({ size: { width, height } }) => <div>{width} x {height}</div>)

      const mounted = mount(<SizeAwareComponent />)

      // Initial render should be as expected.
      expect(mounted.html()).toEqual(placeholderHtml)

      // Get the callback for size changes.
      const checkIfSizeChangedCallback = resizeDetectorMock.listenTo.args[0][1]
      checkIfSizeChangedCallback({
        getBoundingClientRect: () => ({ width: 100, height: 150 }),
      })

      // Update should have occurred immediately.
      expect(mounted.text()).toEqual('100 x 150')
    })
  })

  describe('When it receives new non-size props', () => {
    it('Then the new props should be passed into the component', () => {
      const SizeAwareComponent = sizeMe({
        monitorHeight: true,
        monitorWidth: true,
      })(({ size: { width, height }, otherProp }) => (
        <div>{width} x {height} & {otherProp}</div>
      ))

      const mounted = mount(<SizeAwareComponent otherProp="foo" />)

      // Get the callback for size changes.
      const checkIfSizeChangedCallback = resizeDetectorMock.listenTo.args[0][1]
      checkIfSizeChangedCallback({
        getBoundingClientRect: () => ({ width: 100, height: 100 }),
      })

      // Output should contain foo.
      expect(mounted.text()).toEqual('100 x 100 & foo')

      // Update the other prop.
      mounted.setProps({ otherProp: 'bar' })

      // Output should contain foo.
      expect(mounted.text()).toEqual('100 x 100 & bar')
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
      })(({ size: { width, height } }) => (
        <div>{width || 'undefined'} x {height || 'undefined'}</div>
      ))

      const mounted = renderToString(
        <SizeAwareComponent otherProp="foo" />,
      ).replace(/<!-- \/?react-text(: \d)? -->/g, '')

      // Output should contain undefined for width and height.
      expect(mounted).toContain('undefined x undefined')
    })
  })
})
