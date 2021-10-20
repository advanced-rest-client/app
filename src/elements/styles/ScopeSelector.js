import { css } from 'lit-element';

export default css`
:host {
  display: block;
  outline: none;
  box-sizing: border-box;
}

anypoint-autocomplete {
  top: 52px;
}

.input-container {
  position: relative;
}

.add-button,
.delete-icon {
  margin-left: 12px;
}

.form-label {
  margin: 12px 8px;
}

.scope-input {
  width: auto;
}

.scopes-list {
  list-style: none;
  margin: 12px 8px;
  padding: 0;
}

.scope-item {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.scope-display {
  overflow: hidden;
  font-size: var(--oauth2-scope-selector-font-size, 16px);
}

.scope-item[data-two-line] {
  margin-bottom: 12px;
}

.scope-item[data-two-line] .scope-display {
  font-weight: 400;
}

.scope-item-label {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.scope-display div[data-secondary] {
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  color: var(--oauth2-scope-selector-item-description-color, #737373);
}
`;