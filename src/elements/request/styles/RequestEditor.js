import { css } from 'lit-element';

export default css`
:host {
  display: block;
  --method-label-default-color: rgb(128, 128, 128);
}

[hidden] {
  display: none !important;
}

.content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.panel {
  flex: 1;
  overflow: hidden auto;
  box-sizing: border-box;
  background: var(--request-editor-panel, var(--primary-background-color, inherit));
  padding: 0px 8px;
}

body-editor {
  height: 100%;
}

.url-meta {
  display: flex;
  align-items: center;
  padding: 12px 24px;
  background-color: var(--request-editor-url-area-background-color, #f6f6f6);
}

url-input-editor {
  flex: 1;
  margin: 0 8px;
  background-color: var(--request-editor-url-input-background-color, rgb(255, 255, 255));
  border-radius: 20px;
  /* --url-input-editor-border-color: transparent; */
}

authorization-method {
  max-width: 900px;
}

.http-label {
  display: block;
  width: 24px;
  height: 24px;
  background-color: var(--http-method-label-color, var(--method-label-default-color));
  border-radius: 50%;
}

.http-label[data-method="get"] {
  background-color: var(--http-get-color, rgb(0, 128, 0));
}

.http-label[data-method='post'] {
  background-color: var(--http-post-color, rgb(33, 150, 243));
}

.http-label[data-method='put'] {
  background-color: var(--http-put-color, rgb(255, 165, 0));
}

.http-label[data-method='delete'] {
  background-color: var(--http-delete-color, rgb(244, 67, 54));
}

.http-label[data-method='patch'] {
  background-color: var(--http-patch-color, rgb(156, 39, 176));
}

.http-label[data-method='options'] {
  background-color: var(--http-options-color, var(--method-label-default-color));
}

.http-label[data-method='head'] {
  background-color: var(--http-head-color, var(--method-label-default-color));
}

.http-label[data-method='trace'] {
  background-color: var(--http-trace-color, var(--method-label-default-color));
}

.http-label[data-method='connect'] {
  background-color: var(--http-connect-color, var(--method-label-default-color));
}

.method-list {
  border-radius: 12px;
  box-shadow: var(--anypoint-dropdown-shadow);
}

.method-selector {
  display: flex;
  align-items: center;
  min-height: 36px;
  cursor: pointer;
}

.method-selector arc-icon {
  margin-left: 12px;
}

.method-selector .label {
  display: block;
  font-size: var(--method-selector-label-size, 1.4rem);
  font-weight: 300;
  flex: 1;
}

.menu-item[disabled] {
  color: var(--menu-item-disabled-color, #9e9e9e);
}

.separator {
  height: 1px;
  background-color: var(--menu-item-divider-color, #e5e5e5);
  margin: 8px 0;
}

.request-menu {
  --anypoint-menu-button-border-radius: 12px;
}

.editor-tabs {
  border-bottom: 1px #e5e5e5 solid;
  min-height: 48px;
}

.tab-counter {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: var(--accent-color);
  color: #fff;
  width: 20px;
  height: 20px;
  font-size: 0.85rem;
}

.curl-input {
  min-width: 360px;
}
`;
