import { MonacoLoader } from "@advanced-rest-client/monaco-support";
import { DemoBindings } from '../lib/DemoBindings.js';
import { ArcScreen } from '../../pages.js';

(async () => {
  const bindings = new DemoBindings();
  await bindings.initialize();

  const base = new URL('/node_modules/monaco-editor/', window.location.href).toString();
  MonacoLoader.createEnvironment(base);
  await MonacoLoader.loadMonaco(base);
  await MonacoLoader.monacoReady();

  const page = new ArcScreen();
  page.initialize();
})();
