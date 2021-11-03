/** @typedef {import('@web/test-runner').TestRunnerConfig} TestRunnerConfig */

export default /** @type TestRunnerConfig */ ({
  files: 'test/**/*.test.js',
  // files: 'test/variables/*.test.js',
  nodeResolve: true,
  concurrency: 1,
  testFramework: {
    config: {
      timeout: 5000,
    }
  },

  testRunnerHtml: testFramework =>
  `<html>
    <body>
      <script src="dev/jexl.window.js"></script>
      <script type="module" src="${testFramework}"></script>
    </body>
  </html>`,
})
