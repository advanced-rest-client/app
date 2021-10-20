import { css } from 'lit-element';

export default css`
:host {
  display: flex;
  flex-direction: column;
}

.tabs {
  display: flex;
  align-items: center;
  user-select: none;
  border-top: 1px var(--response-tabs-border-color, #e5e5e5) solid;
  border-bottom: 1px var(--response-tabs-border-color, #e5e5e5) solid;
  outline: none;
}

.tab {
  display: flex;
  align-items: center;
  cursor: pointer;
  border-bottom: 2px transparent solid;
  padding: 2px 0px 2px 12px;
}

.tab.selected {
  border-bottom-color: var(--accent-color);
}

.tab-close {
  width: 16px;
  height: 16px;
  padding: 4px;
  margin-left: 8px;
  border-radius: 12px;
  cursor: default;
  visibility: hidden;
}

.tab-close:hover {
  background-color: var(--response-tab-close-hover-background-color, #e5e5e5);
}

.tab-close:active {
  background-color: var(--response-tab-close-active-background-color, #FFE0B2);
}

.tab.selected .tab-close,
.tab:hover .tab-close {
  visibility: visible;
}

.tabs-menu {
  margin: 0;
  padding: 0;
}

.clear-button {
  margin-left: auto;
}

.empty-background {
  flex: 1;
  background: var(--response-empty-panel-background-color, #EEEEEE);
}

.empty-screen {
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  flex: 1;
}

.response-meta,
.status-line {
  display: flex;
  align-items: center;
}

.response-meta {
  padding: 4px 12px;
  border-bottom: 1px var(--response-tabs-border-color, #e5e5e5) solid;
}

.loading-time-label {
  display: block;
  margin-left: auto;
  margin-right: 12px;
}

.response-size-label {
  display: block;
}

.code {
  color: var(--response-status-code-color, #fff);
  background-color: var(--arc-status-code-color-200, rgb(36, 107, 39));
  padding: 2px 12px;
  border-radius: 12px;
  margin-right: 4px;
}

.code.error {
  background-color: var(--arc-status-code-color-500, rgb(211, 47, 47));
}

.code.warning {
  background-color: var(--arc-status-code-color-400, rgb(171, 86, 0));
}

.code.info {
  background-color: var(--arc-status-code-color-300, rgb(48, 63, 159));
}

.empty-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.status-url {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding-top: 12px;
  padding-bottom: 12px;
  font-size: 120%;
  padding-left: 16px;
  background: var(--response-status-view-request-url-background-color, #6B6C6D);
  color: var(--response-status-view-request-url-color, #fff);
  font-family: var(--arc-font-code-family, initial);
}

.http-method {
  margin-right: 12px;
}

.request-url {
  word-break: break-all;
}

summary {
  font-weight: 500;
  height: 40px;
  display: flex;
  align-items: center;
  cursor: default;
  user-select: none;
}

.summary-content {
  margin-left: 16px;
}

.status-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  min-height: 56px;
  padding: 20px 0;
}

.status-label {
  width: 40px;
}

.text {
  user-select: text;
}

.status-value {
  display: flex;
  flex: 1;
  flex-direction: row;
  align-items: center;
}

.status-value > span {
  display: block;
}

.status-value.status.text > span:not(:first-child) {
  margin-left: 8px;
}

.redirect-value {
  margin-top: 12px;
  flex: 1;
}

.auto-link {
  color: var(--link-color);
}

.redirect-code {
  margin: 4px 0;
}

.panel {
  background: var(--response-view-panel, var(--primary-background-color, inherit));
}

.panel:not(#panel-response):not(#panel-raw),
response-body {
  padding: 8px;
}

:host(.scrolling-region) .panel {
  height: 100%;
  overflow: auto;
}

.size-warning {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 40px 0;
}

.info-message {
  display: flex;
  align-items: center;
}

.info-message arc-icon {
  margin-right: 12px;
}
`;
