import { css } from 'lit-element';

export default css `
:host {
  display: block;
}

pre {
  user-select: text;
  margin: 8px;
  white-space: pre-wrap;
}

.worker-error {
  color: var(--error-color);
}

.token a {
  color: inherit;
}

.line-numbers .line-numbers-rows {
  position: absolute;
  pointer-events: none;
  top: 0;
  font-size: 100%;
  left: -3.8em;
  width: 3em; /* works for line-numbers below 1000 lines */
  letter-spacing: -1px;
  border-right: 1px solid var(--response-code-line-numbers-border-color, #999);
  user-select: none;
}

.line-numbers-rows > span {
  display: block;
  counter-increment: linenumber;
}

.line-numbers-rows > span:before {
  content: counter(linenumber);
  color: var(--response-code-line-numbers-color, #999);
  display: block;
  padding-right: 0.8em;
  text-align: right;
}

.line-numbers {
  position: relative;
  padding-left: 3.8em;
  counter-reset: linenumber;
}

.line-numbers > code {
  position: relative;
  white-space: inherit;
}

.token.punctuation.brace-hover,
.token.punctuation.brace-selected {
	outline: solid 1px;
}

.toggle-target {
  position: absolute;
  width: 12px;
  height: 12px;
  left: -8px;
  border: 1px solid var(--response-code-toggle-line-border-color, rgb(229, 229, 229));
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-top: 0.2rem;
}

.toggle-target::before {
  content: '+';
}

.toggle-target.opened::before {
  content: '-';
}

.toggle-padding {
  padding-left: 8px;
}
`;
