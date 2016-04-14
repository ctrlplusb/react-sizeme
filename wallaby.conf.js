// Whenever wallaby loads the config file (and later uses babel),
// babel will know that we are in the `test` env.
process.env.BABEL_ENV = `test`;
process.env.NODE_ENV = `test`;
process.env.BABEL_DISABLE_CACHE = 1;

module.exports = function (wallaby) {
  return {
    files: [
      `src/**/*.js`,
      `test/**/*.js`,
      `!test/**/*.test.js`,
    ],

    tests: [
      `test/**/*.test.js`
    ],

    compilers: {
      '**/*.js': wallaby.compilers.babel({
        babel: require(`babel-core`),
        babelrc: true
      })
    },

    env: {
      type: `node`,
      runner: `node`,
      params: {
        env: `NODE_ENV=test` // semi-colon seperated.
      }
    },

    testFramework: `mocha`,

    bootstrap: () => {
      require(`./test/setup`);
    },

    debug: true
  };
};
