import { css } from 'lit-element';

export default css`
:host {
  display: block;
}

.header {
  display: flex;
  flex-direction: row;
  align-items: center;
}

h2 {
  margin-left: 16px;
  flex: 1;
  font-weight: 400;
}

h3 {
  margin-left: 16px;
  font-weight: 400;
}

paper-progress {
  width: 100%;
}

.error-toast {
  background-color: var(--warning-primary-color, #FF7043);
  color: var(--warning-contrast-color, #fff);
}

.add-fab {
  position: fixed;
  bottom: 20px;
  right: 20px;
}

.empty-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
}

host-rules-tester {
  margin: 8px 16px;
  padding: 8px;
  border: 1px #e5e5e5 solid;
}

.bottom-sheet-container  {
  width: var(--bottom-sheet-width, 100%);
  max-width: var(--bottom-sheet-max-width, 700px);
  right: var(--bottom-sheet-right, 40px);
  left: var(--bottom-sheet-left, auto);
}

.form-row {
  display: flex;
  align-items: center;
  flex: 1;
}

.params-list {
  margin: 12px 0;
}

.table-labels {
  display: flex;
  align-items: center;
  font-size: .94rem;
  font-weight: 500;
  height: 48px;
}

.param-name-label {
  margin-left: 52px;
  /* inputs default size is 200 */
  width: 200px;
  display: block;
}

.param-switch {
  margin: 0px 8px 0px 0px;
}

anypoint-input {
  margin: 0;
}

.param-name {
  margin-right: 4px;
}

.param-value {
  flex: 1;
}
`;
