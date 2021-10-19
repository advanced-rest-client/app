/** @typedef {import('@web/test-runner').TestRunnerConfig} TestRunnerConfig */

export default /** @type TestRunnerConfig */ ({
  // files: 'test/request-model/RequestModel.events.test.js',
  files: 'test/**/*.test.js',
  nodeResolve: true,
  concurrency: 1,
  watch: true,
  testFramework: {
    config: {
      timeout: 10000,
    },
  },
});
