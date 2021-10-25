import { css } from 'lit-element';

export default css`
:host {
  display: block;
}

.inputs {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.url-input {
  flex: 1;
}

output {
  display: block;
  padding: 8px 4px;
  font-weight: 500;
  font-family: var(--arc-font-code-family);
}
`;
