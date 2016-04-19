import React from 'react';
import { expect } from 'chai';
import { describeWithDOM } from './jsdom';
import sinon from 'sinon';
import { mount } from 'enzyme';

const html = `
<!doctype html>
<html>
  <head>
    <style>
      .container {
        width: 1000px;
        height: 200px;
      }
    </style>
  </head>
  <body>
    <div id="container" class="container" style="width: 100px; height: 50px;"></div>
  </body>
</html>
`;

describeWithDOM(`Given the SizeMe library`, () => {
  let SizeMe;
  let resizeDetectorMock;
  const placeholderHtml = `<div style="width: 100%; height: 100%; position: relative;"></div>`;

  beforeEach(() => {
    SizeMe = require(`../src/index.js`).default;

    // Set up our mocks.
    const SizeMeRewireAPI = SizeMe.__RewireAPI__;

    resizeDetectorMock = {
      // :: domEl -> void
      removeAllListeners: sinon.spy(),
      // :: (domeEl, callback) -> void
      listenTo: sinon.spy()
    };
    SizeMeRewireAPI.__Rewire__(`resizeDetector`, resizeDetectorMock);
  });

  describe(`When providing a configuration object`, () => {
    describe(`And the refresh rate is below 16`, () => {
      it(`Then an error should be thrown`, () => {
        const action = () => {
          SizeMe({ refreshRate: 15 });
        };

        expect(action).to.throw(/don't put your refreshRate lower than 16/);
      });
    });

    describe(`And both monitor values are set to false`, () => {
      it(`Then an error should be thrown`, () => {
        const action = () => {
          SizeMe({ monitorHeight: false, monitorWidth: false });
        };

        expect(action).to.throw(/You have to monitor at least one of the width or height/);
      });
    });
  });

  describe(`And the resize detector`, () => {
    describe(`When mounting and unmounting the placeholder component`, () => {
      it(`Then the resizeDetector registration and deregistration should be called`, () => {
        const SizeAwareComponent = SizeMe()(() => <div></div>);

        const mounted = mount(<SizeAwareComponent />);

        expect(resizeDetectorMock.listenTo.callCount).to.equal(1);
        expect(resizeDetectorMock.removeAllListeners.callCount).to.equal(0);

        mounted.unmount();

        expect(resizeDetectorMock.listenTo.callCount).to.equal(1);
        expect(resizeDetectorMock.removeAllListeners.callCount).to.equal(1);
      });
    });

    describe(`When mounting and unmounting a size aware component`, () => {
      it(`Then the resizeDetector registration and deregistration should be called`, () => {
        const SizeAwareComponent = SizeMe({ monitorHeight: true })(
          ({ size: { width, height } }) => <div>{width} x {height}</div>
        );

        const mounted = mount(<SizeAwareComponent />);

        // An add listener should have been called for the placeholder.
        expect(resizeDetectorMock.listenTo.callCount).to.equal(1);
        expect(resizeDetectorMock.removeAllListeners.callCount).to.equal(0);

        // Get the callback for size changes.
        const checkIfSizeChangedCallback = resizeDetectorMock.listenTo.args[0][1];
        checkIfSizeChangedCallback({
          getBoundingClientRect: () => ({
            width: 100,
            height: 100
          })
        });

        // Our actual component should have mounted, therefore a removelistener
        // should have been called on the placeholder, and an add listener
        // on the newly mounted component.
        expect(mounted.text()).to.equal(`100 x 100`);
        expect(resizeDetectorMock.listenTo.callCount).to.equal(2);
        expect(resizeDetectorMock.removeAllListeners.callCount).to.equal(1);

        // umount
        mounted.unmount();

        // The remove listener should have been called!
        expect(resizeDetectorMock.listenTo.callCount).to.equal(2);
        expect(resizeDetectorMock.removeAllListeners.callCount).to.equal(2);
      });
    });
  });

  describe(`When rendering a size aware component`, () => {
    describe(`And no className or style has been provided`, () => {
      it(`Then it should render the default placeholder`, () => {
        const SizeAwareComponent = SizeMe()(() => <div></div>);

        const mounted = mount(<SizeAwareComponent />);

        expect(mounted.html())
          .to.equal(placeholderHtml);
      });
    });

    describe(`And only a className has been provided`, () => {
      it(`Then it should render a placeholder with the className`, () => {
        const SizeAwareComponent = SizeMe()(() => <div></div>);

        const mounted = mount(<SizeAwareComponent className={`foo`} />);

        expect(mounted.html())
          .to.equal(`<div class="foo"></div>`);
      });
    });

    describe(`And only a style has been provided`, () => {
      it(`Then it should render a placeholder with the style`, () => {
        const SizeAwareComponent = SizeMe()(() => <div></div>);

        const mounted = mount(<SizeAwareComponent style={{ height: `20px` }} />);

        expect(mounted.html())
          .to.equal(`<div style="height: 20px;"></div>`);
      });
    });

    describe(`And a className and style have been provided`, () => {
      it(`Then it should render a placeholder with both`, () => {
        const SizeAwareComponent = SizeMe()(() => <div></div>);

        const mounted = mount(
          <SizeAwareComponent style={{ height: `20px` }} className={`foo`} />
        );

        expect(mounted.html())
          .to.equal(`<div class="foo" style="height: 20px;"></div>`);
      });
    });

    describe(`And the size event has occurred when only width is being monitored`, () => {
      it(`Then expected sizes should be provided to the rendered component`, () => {
        const SizeAwareComponent = SizeMe({ monitorWidth: true, monitorHeight: false })(
          ({ size: { width, height } }) => <div>{width} x {height || `null`}</div>
        );

        const mounted = mount(<SizeAwareComponent />);

        // Initial render should be as expected.
        expect(mounted.html()).to.equal(placeholderHtml);

        // Get the callback for size changes.
        const checkIfSizeChangedCallback = resizeDetectorMock.listenTo.args[0][1];
        checkIfSizeChangedCallback({
          getBoundingClientRect: () => ({ width: 100, height: 150 })
        });

        // Update should have occurred immediately.
        expect(mounted.text()).to.equal(`100 x null`);
      });
    });

    describe(`And the size event has occurred when only height is being monitored`, () => {
      it(`Then expected sizes should be provided to the rendered component`, () => {
        const SizeAwareComponent = SizeMe({ monitorWidth: false, monitorHeight: true })(
          ({ size: { width, height } }) => <div>{width || `null`} x {height}</div>
        );

        const mounted = mount(<SizeAwareComponent />);

        // Initial render should be as expected.
        expect(mounted.html()).to.equal(placeholderHtml);

        // Get the callback for size changes.
        const checkIfSizeChangedCallback = resizeDetectorMock.listenTo.args[0][1];
        checkIfSizeChangedCallback({
          getBoundingClientRect: () => ({ width: 100, height: 150 })
        });

        // Update should have occurred immediately.
        expect(mounted.text()).to.equal(`null x 150`);
      });
    });

    describe(`And the size event has occurred when width and height are being monitored`, () => {
      it(`Then expected sizes should be provided to the rendered component`, () => {
        const SizeAwareComponent = SizeMe({ monitorWidth: true, monitorHeight: true })(
          ({ size: { width, height } }) => <div>{width} x {height}</div>
        );

        const mounted = mount(<SizeAwareComponent />);

        // Initial render should be as expected.
        expect(mounted.html()).to.equal(placeholderHtml);

        // Get the callback for size changes.
        const checkIfSizeChangedCallback = resizeDetectorMock.listenTo.args[0][1];
        checkIfSizeChangedCallback({
          getBoundingClientRect: () => ({ width: 100, height: 150 })
        });

        // Update should have occurred immediately.
        expect(mounted.text()).to.equal(`100 x 150`);
      });
    });

    describe(`And it receives new non-size props`, () => {
      it(`Then the new props should be passed into the component`, () => {
        const SizeAwareComponent = SizeMe({ monitorHeight: true, monitorWidth: true })(
          function ({ size: { width, height }, otherProp }) {
            return <div>{width} x {height} & {otherProp}</div>;
          }
        );

        const mounted = mount(<SizeAwareComponent otherProp="foo" />);

        // Get the callback for size changes.
        const checkIfSizeChangedCallback = resizeDetectorMock.listenTo.args[0][1];
        checkIfSizeChangedCallback({
          getBoundingClientRect: () => ({ width: 100, height: 100 })
        });

        // Output should contain foo.
        expect(mounted.text()).to.equal(`100 x 100 & foo`);

        // Update the other prop.
        mounted.setProps({ otherProp: `bar` });

        // Output should contain foo.
        expect(mounted.text()).to.equal(`100 x 100 & bar`);
      });
    });
  });
}, html);
