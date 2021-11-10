import { MenuItem } from '@api-client/context-menu';

/** @typedef {import('@api-client/context-menu').ContextMenuCommand} ContextMenuCommand */

const commands = /** @type MenuItem[] */ ([
  // new
  new MenuItem(/** @type ContextMenuCommand */ ({
    target: 'all',
    label: 'Themes',
    title: 'Change the application theme',
    id: 'application:open-themes'
  })),
]);
export default commands;
