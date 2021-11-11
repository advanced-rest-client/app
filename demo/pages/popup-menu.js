import { DemoBindings } from '../lib/DemoBindings.js';
import { DemoPopupMenuBindings } from '../lib/DemoPopupMenuBindings.js';
import { MenuScreen } from '../../index.js';

(async () => {
  const bindings = new DemoBindings();
  await bindings.initialize();

  const popupBindings = new DemoPopupMenuBindings();
  await popupBindings.initialize();

  const page = new MenuScreen();
  page.initialize();
})();
