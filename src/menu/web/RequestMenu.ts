import { ContextMenuCommand, MenuItem } from '@api-client/context-menu';

const commands = ([
  // new
  new MenuItem(({
    target: 'all',
    label: 'Run current tab',
    title: 'Runs the request in the current tab',
    id: 'request:send-current'
  } as ContextMenuCommand)),

  // web session
  new MenuItem(({
    target: 'all',
    type: 'separator',
  } as ContextMenuCommand)),
  new MenuItem(({
    target: 'all',
    label: 'Web session',
    title: 'Options related to a web session processing',
    children: [
      new MenuItem(({
        label: 'Cookie manager',
        id: 'application:open-cookie-manager',
      } as ContextMenuCommand)),
      new MenuItem(({
        label: 'Client certificates',
        id: 'application:open-client-certificates',
      } as ContextMenuCommand)),
      new MenuItem(({
        target: 'all',
        type: 'separator',
      })),
      new MenuItem(({
        label: 'Learn more',
        id: 'application:web-session-help',
      } as ContextMenuCommand)),
    ],
  } as ContextMenuCommand)),
  new MenuItem(({
    target: 'all',
    label: 'Hosts',
    id: 'application:open-hosts-editor',
  } as ContextMenuCommand)),
]);
export default commands;
