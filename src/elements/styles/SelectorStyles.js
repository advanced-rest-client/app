import { css } from 'lit-element';

export default css`
:host {
  display: block;
  --anypoint-item-icon-width: 56px;
}

::slotted([hidden]) {
  display: none !important;
}

:host([horizontal]) .container {
  display: flex;
}

:host([horizontal]) .selector,
:host([horizontal]) .auth {
  flex: 1;
}

:host([horizontal]) .selector {
  max-width: 320px;
  padding-right: 12px;
  margin-right: 12px;
  border-right: 1px #e5e5e5 solid;
}
`;
