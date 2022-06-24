import { ContextMenuCommand, MenuItem } from '@api-client/context-menu';

const commands = ([
  new MenuItem(({
    target: 'all',
    label: 'License information',
    id: 'application:open-license'
  } as ContextMenuCommand)),
  new MenuItem(({
    target: 'all',
    label: 'Privacy policy',
    id: 'application:open-privacy-policy'
  } as ContextMenuCommand)),
  new MenuItem(({
    target: 'all',
    label: 'Documentation',
    id: 'application:open-documentation'
  } as ContextMenuCommand)),
  new MenuItem(({
    target: 'all',
    label: 'Frequently Asked Questions',
    id: 'application:open-faq'
  } as ContextMenuCommand)),
  new MenuItem(({
    target: 'all',
    type: 'separator',
  } as ContextMenuCommand)),
  new MenuItem(({
    target: 'all',
    label: 'Community Discussions',
    id: 'application:open-discussions'
  } as ContextMenuCommand)),
  new MenuItem(({
    target: 'all',
    label: 'Report Issue',
    id: 'application:report-issue'
  } as ContextMenuCommand)),
  new MenuItem(({
    target: 'all',
    label: 'Search Issues',
    id: 'application:search-issues'
  } as ContextMenuCommand)),
  new MenuItem(({
    target: 'all',
    type: 'separator',
  } as ContextMenuCommand)),
  new MenuItem(({
    target: 'all',
    label: 'About ARC',
    id: 'application:about'
  } as ContextMenuCommand)),
]);
export default commands;
