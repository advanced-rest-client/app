import { css } from 'lit-element';

export default css`
:host {
  display: block;
  outline: none;
}

h2 {
  font-size: 1.34rem;
  font-weight: 300;
}

form {
  outline: none;
}
anypoint-input {
  width: 100%;
}

anypoint-checkbox {
  display: block;
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
`;
