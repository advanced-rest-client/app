import { css } from 'lit-element';

export default css`
:host {
  display: inline-block;
}

.label {
  display: block;
  /* font-size: var(--environment-selector-label, 1.4rem); */
  flex: 1;
}

.environment-selector {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  min-height: 36px;
  margin-bottom: 20px;
}

.environment-selector arc-icon {
  margin-left: 12px;
}

.environment-label {
  font-size: 1rem;
}

.env-list {
  border-radius: 12px;
  box-shadow: var(--anypoint-dropdown-shadow);
}

.separator {
  height: 1px;
  background-color: var(--separator-color, #e5e5e5);
  margin: 8px 0;
}

.env-input-wrapper {
  display: flex;
  align-items: center;
}
`;
