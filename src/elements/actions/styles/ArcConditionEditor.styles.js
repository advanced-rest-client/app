import { css } from 'lit-element';

export default css`
:host {
  display: block;
}

anypoint-input {
  display: inline-flex;
  width: auto;
  max-width: 700px;
  margin: 8px 8px 12px 8px;
}

anypoint-input[type=number] {
  width: auto;
  max-width: 200px;
}

.action-card.closed {
  display: flex;
  align-items: center;
  background-color: var(--action-condition-closed-background-color, #E0E0E0);
  border-bottom: 1px var(--action-condition-closed-border-bottom-color, transparent) solid;
  padding: 4px 12px 4px 24px;
}

.closed strong {
  margin: 0 4px;
}

.action-delete,
.action-open,
.action-help {
  margin-left: auto;
}

anypoint-dropdown-menu {
  margin: 8px;
}

.form-row,
.help-hint-block {
  display: flex;
  align-items: center;
}

.form-row > anypoint-input {
  flex: 1;
}

.icon.help {
  color: var(--primary-color);
  cursor: help;
}

.editor-contents {
  padding: 8px;
}
`;
