import { css } from "lit-element";

export default css`
:host {
  display: block;
}

.list-item {
  min-height: var(--headers-list-item-min-height, 20px);
  user-select: text;
  word-break: break-all;
  font-family: var(--arc-font-code-family);
}

.list-item > span {
  display: inline-block;
}

.header-name {
  font-weight: 600;
}

.auto-link {
  color: var(--link-color);
}
`;