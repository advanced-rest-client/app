import { css } from 'lit-element';

export default css`
:host {
  display: block;
}

.button-content {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.cert-meta {
  display: flex;
  flex-direction: column;
}

.cert-type-ico {
  color: var(--accent-color);
  text-transform: uppercase;
  margin-right: 8px;
}

anypoint-radio-button {
  width: 100%;
  align-items: flex-start;
  padding-top: 8px;
  padding-bottom: 8px;
  margin: 0;
}

.default {
  align-items: center;
}

.name {
  font-size: 1rem;
  font-weight: 400;
  margin-bottom: 8px;
  margin-top: 7px;
}

.created {
  font-size: 0.85rem;
  color: var(--auth-method-certificate-second-line-color, initial);
  font-weight: 200;
}

.list {
  overflow: auto;
  max-height: 400px;
}

.empty-screen {
  margin: 1em 12px;
}
`;
