import { MonacoLoader } from "@advanced-rest-client/monaco-support";
import { DemoBindings } from '../lib/DemoBindings.js';
import { ArcScreenWeb } from '../../index.js';
import env from '../env.js';

(async () => {
  const bindings = new DemoBindings();
  await bindings.initialize();

  const base = new URL('/node_modules/monaco-editor/', window.location.href).toString();
  MonacoLoader.createEnvironment(base);
  await MonacoLoader.loadMonaco(base);
  await MonacoLoader.monacoReady();

  const page = new ArcScreenWeb();
  page.systemVariables = env;
  page.initialize();
})();
