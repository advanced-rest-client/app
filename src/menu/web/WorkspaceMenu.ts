import { ContextMenuCommand, MenuItem } from '@api-client/context-menu';

const commands = ([
  new MenuItem(({
    target: 'all',
    label: 'Open workspace details',
    id: 'application:open-workspace-details'
  } as ContextMenuCommand)),
  new MenuItem(({
    target: 'all',
    label: 'Save as...',
    id: 'application:export-workspace'
  } as ContextMenuCommand)),
  new MenuItem(({
    target: 'all',
    label: 'Open from file',
    id: 'application:import-workspace'
  } as ContextMenuCommand)),
]);
export default commands;
