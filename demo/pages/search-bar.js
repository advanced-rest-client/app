import { ElectronBindings } from '../lib/ElectronBindings.js';
import { SearchBar } from '../../pages.js';

const bindings = new ElectronBindings();
bindings.initialize();
const page = new SearchBar();
page.initialize();
