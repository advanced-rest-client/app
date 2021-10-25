import { css } from 'lit-element';

export default css`
:host {
  display: block;
}

.vars-title-line {
  display: flex;
  align-items: center;
}

.vars-title-line .section-title {
  flex: 1;
}

.var-list {
  margin: 0;
  padding: 0;
  min-width: 300px;
}

.var-item {
  display: flex;
  word-break: normal;
  user-select: text;
  cursor: text;
  align-items: center;
  height: 40px;
  max-width: 480px;
}

.var-name {
  color: var(--variables-overlay-var-name-color, rgba(81, 81, 81, .74));
  margin-right: 16px;
  min-width: 80px;
}

.var-value {
  color: var(--variables-overlay-var-value-color, rgba(81, 81, 81, 1));
  display: inline-block;
  flex: 1;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.var-item.disabled {
  text-decoration: line-through;
}

.var-editor {
  display: flex;
  align-items: center;
  min-width: 480px;
}

.var-list-actions {
  margin-left: auto;
  display: none;
}

.var-item:hover .var-list-actions {
  display: block;
}
`;
