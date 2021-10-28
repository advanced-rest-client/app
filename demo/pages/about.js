import { ElectronBindings } from '../lib/ElectronBindings.js';
import { AboutScreen } from '../../pages.js';

const bindings = new ElectronBindings();
bindings.initialize();
const page = new AboutScreen();
page.initialize();
