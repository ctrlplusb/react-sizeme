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
        const refreshRate = 20000;

        const SizeAwareComponent = SizeMe({ refreshRate })(
          function ({ size: { width, height } }) {
            return <div>{width} x {height}</div>;
          }
        );

        const mounted = mount(<SizeAwareComponent />);

        expect(resizeDetectorMock.listenTo.callCount).to.equal(1);
        expect(resizeDetectorMock.removeAllListeners.callCount).to.equal(0);

        mounted.unmount();

        expect(resizeDetectorMock.listenTo.callCount).to.equal(1);
        expect(resizeDetectorMock.removeAllListeners.callCount).to.equal(1);
      });
    });

    describe(`When mounting and unmounting a size aware component`, () => {
      it(`Then the resizeDetector registration and deregistration should be called`, (done) => {
        const refreshRate = 30;

        const SizeAwareComponent = SizeMe({ refreshRate })(
          function ({ size: { width, height } }) {
            return <div>{width} x {height}</div>;
          }
        );

        const mounted = mount(<SizeAwareComponent />);

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

        // Wait for the render callback
        setTimeout(() => {
          // Our actual component should have mounted now
          expect(resizeDetectorMock.listenTo.callCount).to.equal(2);
          expect(resizeDetectorMock.removeAllListeners.callCount).to.equal(1);

          // umount
          mounted.unmount();

          setTimeout(() => {
            expect(resizeDetectorMock.listenTo.callCount).to.equal(2);
            expect(resizeDetectorMock.removeAllListeners.callCount).to.equal(2);

            done();
          }, refreshRate);
        }, refreshRate + 10);
      });
    });

    describe(`When a size change event fires for a mounted size aware component`, () => {
      it(`Then the resizeDetector should be called appropriately`, (done) => {
        const refreshRate = 16;

        const SizeAwareComponent = SizeMe({ refreshRate })(
          function ({ size: { width, height } }) {
            return <div>{width} x {height}</div>;
          }
        );

        mount(<SizeAwareComponent />);

        // Wait for the render callback
        setTimeout(() => {
          // Our actual component should have mounted now
          expect(resizeDetectorMock.listenTo.callCount).to.equal(1);
          expect(resizeDetectorMock.removeAllListeners.callCount).to.equal(0);

          // Get the callback for size changes
          const checkIfSizeChangedCallback = resizeDetectorMock.listenTo.args[0][1];
          checkIfSizeChangedCallback({
            getBoundingClientRect: () => ({
              width: 100,
              height: 100
            })
          });

          // Ok we fired a fake dom update, now we need to wait for it to
          // be processed.
          setTimeout(() => {
            expect(resizeDetectorMock.listenTo.callCount).to.equal(2);
            expect(resizeDetectorMock.removeAllListeners.callCount).to.equal(1);

            checkIfSizeChangedCallback({
              getBoundingClientRect: () => ({
                width: 200,
                height: 100
              })
            });

            setTimeout(() => {
              expect(resizeDetectorMock.listenTo.callCount).to.equal(3);
              expect(resizeDetectorMock.removeAllListeners.callCount).to.equal(2);

              done();
            }, refreshRate);
          }, refreshRate + 5);
        }, refreshRate + 25);
      });
    });
  });

  describe(`When rendering a size aware component`, () => {
    describe(`And no className or style has been provided`, () => {
      it(`Then it should render the default placeholder`, () => {
        const SizeAwareComponent = SizeMe()(
          function ({ size: { width, height } }) {
            return <div>{width} x {height}</div>;
          }
        );

        const mounted = mount(<SizeAwareComponent />);

        const actual = mounted.html();
        const expected = `<div style="width: 100%; height: 100%; position: relative;"></div>`;

        expect(actual).to.equal(expected);
      });
    });

    describe(`And only a className has been provided`, () => {
      it(`Then it should render a placeholder with the className`, () => {
        const SizeAwareComponent = SizeMe()(
          function ({ size: { width, height } }) {
            return <div>{width} x {height}</div>;
          }
        );

        const mounted = mount(<SizeAwareComponent className={`foo`} />);

        const actual = mounted.html();
        const expected = `<div class="foo"></div>`;

        expect(actual).to.equal(expected);
      });
    });

    describe(`And only a style has been provided`, () => {
      it(`Then it should render a placeholder with the style`, () => {
        const SizeAwareComponent = SizeMe()(
          function ({ size: { width, height } }) {
            return <div>{width} x {height}</div>;
          }
        );

        const mounted = mount(<SizeAwareComponent style={{ height: `20px` }} />);

        const actual = mounted.html();
        const expected = `<div style="height: 20px;"></div>`;

        expect(actual).to.equal(expected);
      });
    });

    describe(`And a className and style have been provided`, () => {
      it(`Then it should render a placeholder with both`, () => {
        const SizeAwareComponent = SizeMe()(
          function ({ size: { width, height } }) {
            return <div>{width} x {height}</div>;
          }
        );

        const mounted = mount(
          <SizeAwareComponent
            style={{ height: `20px` }}
            className={`foo`}
          />
        );

        const actual = mounted.html();
        const expected = `<div class="foo" style="height: 20px;"></div>`;

        expect(actual).to.equal(expected);
      });
    });

    describe(`And the size event has occurred`, () => {
      it(`Then the actual size aware component should render`, (done) => {
        const refreshRate = 30;

        const SizeAwareComponent = SizeMe({
          refreshRate
        })(
          function ({ size: { width, height } }) {
            return <div>{width} x {height}</div>;
          }
        );

        const mounted = mount(<SizeAwareComponent />);

        const placeholderHtml =
          `<div style="width: 100%; height: 100%; position: relative;"></div>`;

        // Initial render should be as expected.
        expect(mounted.html()).to.equal(placeholderHtml);

        // Output should be the same before the refresh rate gets hit.
        setTimeout(() => {
          expect(mounted.html()).to.equal(placeholderHtml);
        }, refreshRate - 5);

        // Wait till refresh rate gets hit
        setTimeout(() => {
          // Get the callback for size changes.
          const checkIfSizeChangedCallback = resizeDetectorMock.listenTo.args[0][1];
          checkIfSizeChangedCallback({
            getBoundingClientRect: () => ({
              width: 100,
              height: 100
            })
          });

          setTimeout(() => {
            // Update should have occurred by now.
            expect(mounted.text()).to.equal(`100 x 100`);

            done();
          }, refreshRate);
        }, refreshRate + 5);
      });
    });
  });
}, html);
