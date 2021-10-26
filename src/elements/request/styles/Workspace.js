import { css } from 'lit-element';

export default css`
:host {
  display: flex;
  position: relative;
  flex-direction: column;
}

[hidden] {
  display: none !important;
}

.workspace-panels {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.request-panel {
  flex: 1;
  outline: none;
}

.tabs {
  --anypoint-icon-button-emphasis-low-color: var(--workspace-tabs-add-color, #000);
  --anypoint-icon-button-emphasis-low-hover-background-color: var(--workspace-tabs-add-color-hover-background-color, rgba(0,0,0,0.08));
  --anypoint-icon-button-emphasis-low-focus-background-color: var(--workspace-tabs-add-color-focus-background-color, rgba(0,0,0,0.14));
}

.add-request-button {
  width: 40px;
  height: 40px;
  min-width: 40px;
}

.tab-name {
  display: block;
  max-width: 200px;
  min-width: 20px;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  direction: rtl;
  text-align: end;
}

.tab-divider {
  width: 1px;
  min-width: 1px;
  height: 24px;
  background-color: #e5e5e5;
  display: inline-flex;
}

.close-icon {
  color: var(--arc-request-workspace-tabs-close-color, rgba(0, 0, 0, 0.78));
  border-radius: 50%;
  width: 14px !important;
  height: 14px !important;
}

.close-icon:hover {
  color: var(--arc-request-workspace-tabs-close-color-hover, rgba(255, 255, 255, 0.54));
  background-color: var(--arc-request-workspace-tabs-close-background-color-hover, #FF8A65);
}

.drop-pointer {
  position: absolute;
  left: 4px;
  color: var(--arc-request-workspace-drop-pointer-color, #757575);
  width: 20px;
  height: 24px;
  font-size: 20px;
  top: 36px;
}

.drop-pointer::before {
  content: "⇧";
}

.add-panel-list {
  box-shadow: var(--anypoint-menu-button-context-shadow, var(--anypoint-dropdown-shadow));
  border-radius: var(--anypoint-menu-button-border-radius, 12px);
  padding: 8px 0;
}

.add-panel-list anypoint-item {
  padding: 0 24px;
}

.bottom-sheet-container  {
  width: var(--bottom-sheet-width, 100%);
  max-width: var(--bottom-sheet-max-width, 700px);
  right: var(--bottom-sheet-right, 40px);
  left: var(--bottom-sheet-left, auto);
}
`;
