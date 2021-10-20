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

.lh {
  display: -ms-flexbox;
  display: -webkit-flex;
  display: flex;
  -ms-flex-direction: row;
  -webkit-flex-direction: row;
  flex-direction: row;
}
.meta-row {
  -ms-flex-align: center;
  -webkit-align-items: center;
  align-items: center;
  color: var(--cookie-details-meta-color, rgba(0, 0, 0, 0.87));
  height: 40px;
}
.meta-row .label {
  width: 160px;
  display: inline-block;
}
.meta-row .value {
  display: inline-block;
  white-space: var(--arc-font-nowrap-white-space);
  overflow: var(--arc-font-nowrap-overflow);
  text-overflow: var(--arc-font-nowrap-text-overflow);
}
.actions {
  -ms-flex-pack: end;
  -webkit-justify-content: flex-end;
  justify-content: flex-end;
  margin-top: 20px;
}
.actions anypoint-button {
  padding-left: 12px;
  padding-right: 12px;
}
anypoint-button iron-icon {
  margin-right: 12px;
}`;
