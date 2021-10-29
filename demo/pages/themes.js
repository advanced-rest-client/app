import { ElectronBindings } from '../lib/ElectronBindings.js';
import { ThemesScreen } from '../../pages.js';

const bindings = new ElectronBindings();
bindings.initialize();
const page = new ThemesScreen();
page.initialize();
