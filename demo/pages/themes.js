import { DemoBindings } from '../lib/DemoBindings.js';
import { ThemesScreen } from '../../pages.js';

const bindings = new DemoBindings();
bindings.initialize();
const page = new ThemesScreen();
page.initialize();
