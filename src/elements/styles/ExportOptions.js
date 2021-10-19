import { css } from 'lit-element';

export default css`
:host {
  display: block;
}

[hidden] {
  display: none !important;
}

h3 {
  font-size: 1.24rem;
  font-weight: 400;
}

.icon {
  display: inline-block;
  width: 24px;
  height: 24px;
  fill: currentColor;
}

.actions {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  margin-top: 20px;
}

.actions anypoint-button {
  padding-left: 12px;
  padding-right: 12px;
}

.toggle-option {
  margin: 8px 0;
}

.toggle-option anypoint-checkbox {
  display: block;
}

anypoint-input,
anypoint-masked-input {
  width: auto;
}

.autocomplete-input {
  position: relative;
}
`;
