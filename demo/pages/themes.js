import { DemoBindings } from '../lib/DemoBindings.js';
import { ThemesScreen } from '../../index.js';

(async () => {
  const bindings = new DemoBindings();
  await bindings.initialize();
  const page = new ThemesScreen();
  await page.initialize();
})();
