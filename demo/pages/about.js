import { DemoBindings } from '../lib/DemoBindings.js';
import { AboutScreen } from '../../index.js';

(async () => {
  const bindings = new DemoBindings();
  await bindings.initialize();

  const page = new AboutScreen();
  await page.initialize();
})();
