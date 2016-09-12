/* eslint-disable import/no-extraneous-dependencies */

const chai = require('chai');
const sinonChai = require('sinon-chai');
const createDom = require('./jsdom').createDom;

// Set up chai assert extensions
chai.use(sinonChai);

/**
 * Fix react dom configuration.
 * @see http://stackoverflow.com/questions/26867535/calling-setstate-in-jsdom-based-tests-causing-cannot-render-markup-in-a-worker/26872245
 */
createDom();
