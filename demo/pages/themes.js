import { DemoBindings } from '../lib/DemoBindings.js';
import { ThemesScreen } from '../../pages.js';

(async () => {
  const bindings = new DemoBindings();
  await bindings.initialize();
  const page = new ThemesScreen();
  await page.initialize();
})();
