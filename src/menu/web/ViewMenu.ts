import { ContextMenuCommand, MenuItem } from '@api-client/context-menu';

const commands = ([
  // new
  new MenuItem(({
    target: 'all',
    label: 'Themes',
    title: 'Change the application theme',
    id: 'application:open-themes'
  } as ContextMenuCommand)),
]);
export default commands;
