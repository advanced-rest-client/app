import { css } from 'lit-element';

export default css `
:host {
  display: block;
  --anypoint-item-icon-width: auto;
}

.status-code {
  color: var(--response-status-code-color, #fff);
  background-color: var(--arc-status-code-color-200, rgb(36, 107, 39));
  padding: 2px 12px;
  border-radius: 12px;
  margin-right: 4px;
}

.status-code.error {
  background-color: var(--arc-status-code-color-500, rgb(211, 47, 47));
}

.status-code.warning {
  background-color: var(--arc-status-code-color-400, rgb(171, 86, 0));
}

.status-code.info {
  background-color: var(--arc-status-code-color-300, rgb(48, 63, 159));
}

.loading-time-label {
  display: block;
  margin-left: auto;
  color: var(--har-viewer-page-time-color, inherit);
}

.response-size-label {
  display: block;
}

.entry-detail-line {
  display: flex;
  align-items: center;
}

.entry-location {
  margin-top: 6px;
  font-size: 1.1rem;
}

.entry-timings {
  margin-left: 32px;
  width: calc(40% - 32px);
  display: flex;
}

.time {
  margin-right: 32px;
}

.entry-timings-value {
  display: flex;
  height: 20px;
}

.timing-entry {
  height: 100%;
  background-color: transparent;
}

.timing-entry.blocked {
  background-color: var(--har-timings-blocked-color, #b4b4b4);
}

.timing-entry.dns {
  background-color: var(--har-timings-dns-color, #f6f696);
}

.timing-entry.connect {
  background-color: var(--har-timings-connect-color, #ffc04c);
}

.timing-entry.ssl {
  background-color: var(--har-timings-ssl-color, #8787ff);
}

.timing-entry.send {
  background-color: var(--har-timings-send-color, #ff7f7f);
}

.timing-entry.wait {
  background-color: var(--har-timings-wait-color, #2eac6c);
}

.timing-entry.receive {
  background-color: var(--har-timings-receive-color, #00c0ff);
}

.entry-item {
  border-top: 1px var(--divider-color, rgba(0, 0, 0, 0.12)) solid;
  padding: 0 8px;
}

.entry-item:last-of-type {
  border-bottom: 1px var(--divider-color, rgba(0, 0, 0, 0.12)) solid;
}

.entry-body {
  min-height: 72px;
}

.page-header {
  display: flex;
  height: 56px;
  font-weight: 500;
  align-items: center;
  font-size: 1.2rem;
  padding: 0 8px;
  cursor: default;
}

.page-header .label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--har-viewer-page-color, inherit);
}

.entry-details {
  margin-bottom: 40px;
}

.entry-details-title {
  font-size: 1.2rem;
  margin: 0.67em 0;
}

.body-preview {
  white-space: break-spaces;
  word-break: break-word;
}

.details-list dt {
  font-size: 1.1rem;
  font-weight: 500;
}

.details-list dfn {
  font-weight: 700;
}

.details-content {
  padding: 0 8px;
}

anypoint-listbox {
  background-color: transparent;
}
`;
