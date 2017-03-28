/* @flow */

import sinon from 'sinon';

export default function warningsToErrors() {
  // Ensure console.warnings become thrown errors.
  beforeAll(() => {
    sinon.stub(console, 'error', (warning) => { throw new Error(warning); });
  });

  // While not forgetting to restore it afterwards.
  afterAll(() => { console.error.restore(); });
}
