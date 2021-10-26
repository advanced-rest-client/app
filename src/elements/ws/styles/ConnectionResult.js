import { css } from 'lit-element';

export default css`
:host {
  max-width: 100%;
}

.response-size-label {
  margin-left: auto;
}

.log-item {
  height: 36px;
  cursor: default;
}

.log-item:focus {
  outline-color: var(--accent-color);
}

.log-item td {
  border-bottom: 1px #e5e5e5 solid;
}

.log-item.selected {
  background-color: rgb(0 162 223 / 16%);
}

.log-item.header {
  height: 44px;
  font-weight: 500;
}

.log-item .message {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.log-item.header .message {
  padding-left: 8px;
}

table {
  width: 100%;
  table-layout: fixed;
  border-spacing: 0;
}

.log-item .length,
.log-item .time {
  text-align: right;
}

.log-item .direction {
  margin-right: 12px;
  margin-left: 8px;
  user-select: none;
}

.log-item .direction[data-direction="in"] {
  color: var(--websocket-in-message-color, #009688);
}

.log-item .direction[data-direction="out"] {
  color: var(--websocket-out-message-color, #f44336);
}

.log-item .time {
  width: 210px;
  padding-right: 8px;
}

.log-item .length {
  width: 100px;
}

.panel.logs-panel {
  height: initial;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  flex: 1;
  overflow: hidden;
}

.logs {
  width: 100%;
}

.logs,
.log-preview {
  flex: 1;
  overflow: auto;
}
`;
