import { css } from 'lit-element';

export default css`
:host {
  background-color: var(--web-url-input-background-color, #fff);
  padding: 20px;
  top: 0px;
  max-width: 900px;
  width: 100%;
  box-shadow: var(--box-shadow-6dp);
  transform: translateY(-120%);
  /* transition: transform 0.18s linear; */
  transition: transform 0.18s cubic-bezier(0.96, 0.01, 0.35, 0.99) 0s;
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
}

:host(.opened) {
  transform: translateY(0);
}

.inputs {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 24px;
}

.listbox-wrapper {
  position: relative;
  flex: 1;
  display: flex;
}

.main-input {
  flex: 1;
  margin: 0;
}

.action-button {
  align-self: stretch;
  box-shadow: none;
}
`;