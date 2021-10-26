import { css } from 'lit-element';

export default css`
:host {
  --code-mirror-height: var(--saved-request-editor-cm-height, 200px);
}

form {
  outline: none;
}

.caption {
  display: flex;
  flex-direction: row;
  align-items: center;
  cursor: pointer;
}

.caption-icon {
  color: var(--saved-request-editor-caption-icon-color, rgba(0, 0, 0, 0.74));
  transform: rotate(0deg);
  transition: 0.31s transform ease-in-out;
}

[data-caption-opened] .caption-icon {
  transform: rotate(-180deg);
}

.icon {
  display: inline-block;
  width: 24px;
  height: 24px;
  fill: currentColor;
}

anypoint-input,
anypoint-chip-input {
  width: calc(100% - 16px);
}

.monaco-wrap {
  margin: 0px 8px;
}

.monaco {
  height: 200px;
  width: 100%;
}

.editor-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}
`;
