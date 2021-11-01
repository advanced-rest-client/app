import { DemoBindings } from '../lib/DemoBindings.js';
import { SearchBar } from '../../pages.js';

const bindings = new DemoBindings();
bindings.initialize();
const page = new SearchBar();
page.initialize();
