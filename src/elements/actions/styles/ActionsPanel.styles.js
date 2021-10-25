import { css } from 'lit-element';

export default css`
:host {
  display: block;
}

.self-center {
  align-self: center;
}

.condition-wrapper {
  margin: 24px 0;
  border: 1px solid var(--action-condition-wrapper-border-bottom-color, rgb(229, 229, 229));
  border-radius: 8px;
  /* overflow: hidden; */
}
`;
