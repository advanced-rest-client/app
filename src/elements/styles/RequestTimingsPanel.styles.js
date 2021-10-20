import { css } from 'lit-element';

export default css`
:host {
  display: block;
}

.status-row,
.timings-row {
  flex-direction: row;
  display: flex;
  align-items: center;
  min-height: 56px;
}

.status-row {
  flex-direction: row;
  display: flex;
  justify-content: flex-end;
}

.sub-title {
  font-size: 0.88rem;
  text-transform: uppercase;
}

.status-label {
  width: 60px;
  font-size: var(--request-timings-panel-timing-total-size, 1.1rem);
  font-weight: var(--request-timings-panel-timing-total-weight, 400);
}

.text {
  user-select: text;
  cursor: text;
}

.redirect-value {
  margin-top: 12px;
  flex: 1;
  flex-basis: 0.000000001px;
}

:host([narrow]) .timings-row {
  flex-direction: column;
  align-items: start;
  margin: 20px 0;
}

:host([narrow]) .redirect-value {
  width: 100%;
  flex: auto;
}

:host([narrow]) .status-row {
  justify-content: flex-start;
}
`;