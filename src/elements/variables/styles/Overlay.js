import { css } from 'lit-element';

export default css`
:host {
  display: flex;
  flex-direction: column;
  background-color: var(--variables-overlay-background-color, #fff);
  color: var(--variables-overlay-color, initial);
  box-shadow: var(--anypoint-dropdown-shadow);
  padding: 20px;
  border-radius: 12px;
}

.intro {
  font-size: 0.94rem;
  color: var(--variables-overlay-intro-color, rgba(0,0,0,0.74));
  max-width: 410px;
  margin: 0 0 32px 0;
}

.overlay-footer {
  margin-top: 24px;
  display: flex;
  align-items: center;
}

.overlay-footer anypoint-button:first-of-type {
  margin-left: auto;
}

.overlay-footer anypoint-button {
  padding: 0.7em 0.24em;
  min-width: 40px;
}

.vars-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding-bottom: 4px;
}

.system-variables {
  margin-top: 24px;
}
`;
