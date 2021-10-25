import { css } from 'lit-element';

export default css`
:host {
  display: block;
}

.monaco-wrap {
  margin: 0px 8px;
}

.monaco {
  height: 200px;
  width: 100%;
}

anypoint-input {
  width: calc(100% - 16px);
}

.actions {
  display: flex;
  justify-content: flex-end;
}
`;
