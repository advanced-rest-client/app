import { css } from 'lit-element';

export default css `
:host {
  display: flex;
  flex-direction: column;
  flex: 1;
  flex-basis: 0.000000001px;
  user-select: text;
  margin: 0 16px;
}

.message-wrapper {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.error-icon {
  
  
  display: block;
}

.error-icon .icon {
  width: 128px;
  height: 128px;
  fill: var(--error-message-icon-color, rgba(0, 0, 0, 0.56));
}

.error-desc {
  color: var(--error-message-color, #af1104);
}

.error-code {
  color: var(--error-message-code-color, #414141);
}

.inherit {
  color: inherit !important;
  background-color: inherit !important;
  text-decoration: inherit !important;
}

p,
h3 {
  cursor: text;
}
`;