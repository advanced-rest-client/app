import { css } from 'lit-element';

export default css`
:host {
  display: block;
  height: var(--arc-menu-height, 100vh);
  background-color: var(--arc-menu-background-color, inherit);
}

.menu {
  display: flex;
  flex-direction: row;
  height: inherit;
  overflow: hidden;
}

.rail {
  width: 56px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 56px;
  padding: 12px 0;
}

.menu-item {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px var(--arc-rail-menu-icon-color, var(--accent-color)) solid;
  margin-bottom: 20px;
}

.menu-item arc-icon {
  color: var(--arc-rail-menu-icon-color, var(--accent-color));
}

.menu-item.selected {
  background-color: var(--arc-rail-menu-icon-color, var(--accent-color));
}

.menu-item.selected arc-icon {
  color: var(--arc-rail-menu-icon-selected-color, #fff);
}

.menu-content {
  display: flex;
  flex: 1;
  flex-direction: column;
  height: inherit;
  overflow: hidden;
}

.menu > .content {
  border-left: 1px var(--arc-menu-content-border-color, #e5e5e5) solid;
  border-right: 1px var(--arc-menu-content-border-color, #e5e5e5) solid;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex: 1;
}

.menu-title {
  background-color: var(--arc-menu-title-background-color);
  color: var(--arc-menu-title-color);
  height: 56px;
  display: flex;
  align-items: center;
}

.menu-title-label {
  font-size: 20px;
  margin-left: 24px;
}

.list-drop-icon {
  color: var(--arc-menu-title-color);
}

.menu-title .list-options {
  margin-left: auto;
  color: initial;
  font-size: initial;
}

.list {
  padding: 4px 0;
}

.context-menu-item {
  padding-left: 24px;
  padding-right: 24px;
}

.divider {
  height: 1px;
  background-color: var(--menu-item-divider-color, #e5e5e5);
  margin: 8px 0;
}

:host([anypoint]) .divider {
  padding: 0px 10px;
  margin: 0;
  border-left: 2px var(--anypoint-item-border-left-color, var(--anypoint-color-aluminum4)) solid;
  border-right: 2px var(--anypoint-item-border-right-color, var(--anypoint-color-aluminum4)) solid;
}

.list-options {
  --anypoint-menu-button-border-radius: 12px;
}

history-menu,
saved-menu,
rest-api-menu,
projects-menu,
search-menu {
  overflow: auto;
  flex-direction: column;
  flex: 1 1 0%;
}

.menu-actions {
  padding: 4px 0;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.right-action {
  margin-left: auto;
}

.spacer {
  flex: 1;
}

[hidden],
.hidden {
  display: none !important;
}

anypoint-tab {
  color: var(--arc-menu-tabs-color);
}

.warning-toggle {
  color: var(--arc-menu-warning-toggle-color, #FF5722);
}

.ticket-button {
  background-color: var(--arc-menu-warning-button-gb-color, #fff);
  margin-top: 12px;
}

anypoint-tab {
  margin-left: 0;
  margin-right: 0;
  padding: 0.7em 0.4em;
}

.icon {
  display: inline-block;
  width: 24px;
  height: 24px;
  fill: currentColor;
}

.list-search {
  margin: 0;
  width: 100%;
}

.bottom-sheet-container  {
  width: var(--bottom-sheet-width, 100%);
  max-width: var(--bottom-sheet-max-width, 700px);
  right: var(--cookie-manager-bottom-sheet-right, 40px);
  left: var(--cookie-manager-bottom-sheet-left, auto);
}
`;
