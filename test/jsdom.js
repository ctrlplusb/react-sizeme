/* eslint-disable global-require */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-prototype-builtins */
/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */

const defaultHtml = '<!doctype html><html><body></body></html>';

/**
 * Sets up a DOM environment for use in Node based testing.
 *
 * @param {string} [html='<!doctype html><html><body></body></html>']
 *   The html to use for the test dom.
 *
 * @return {Object}
 *   The jsdom instance used to create the test dom.
 */
export function createDom(html: ?string = defaultHtml) {
  const jsdom = require('jsdom');

  // setup the simplest document possible
  const doc = jsdom.jsdom(html);

  // get the window object out of the document
  const win = doc.defaultView;

  // set globals for mocha that make access to document and window feel
  // natural in the test environment
  global.document = doc;
  global.window = win;
  global.navigator = global.window.navigator;

  // from mocha-jsdom https://github.com/rstacruz/mocha-jsdom/blob/master/index.js#L80
  function propagateToGlobal(window) {
    for (const key in window) {
      if (!window.hasOwnProperty(key)) continue;
      if (key in global) continue;

      global[key] = window[key];
    }
  }

  // take all properties of the window object and also attach it to the
  // mocha global object
  propagateToGlobal(win);

  return jsdom;
}

/**
 * Creates a test description that uses jsdom.
 *
 * @param  {string} description
 *   The text description for the test.
 * @param  {definition} definition
 *   The test body.
 * @param  {string} html
 *   Optional html to use for the jsdom instance.
 *
 * @return The created test suite wrapper.
 */
export function describeWithDOM(description: string, definition: Function, html: ?string) {
  describe('(uses jsdom)', () => {
    createDom(html);
    describe(description, definition);
  });
}
