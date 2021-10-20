import { css } from 'lit-element';

export default css`
:host {
  display: block;
  --anypoint-progress-height: var(--request-timings-progress-height, 12px);
  --anypoint-progress-container-color: var(--request-timings-progress-background, #f5f5f5);
  --anypoint-progress-active-color: var(--request-timings-progress-background, #f5f5f5);
  --anypoint-progress-secondary-color: var(--request-timings-progress-color, #4a4);
}

.row {
  display: flex;
  flex-direction: row;
  align-items: center;
}

anypoint-progress {
  flex: 1;
  flex-basis: 0.000000001px;
}

.label,
.date-value {
  user-select: text;
  cursor: text;
}

.label {
  margin-right: 8px;
}

.timing-label {
  width: var(--request-timings-label-width, 160px);
  /* font-weight: 200; */
}

.timing-value {
  width: var(--request-timings-value-width, 120px);
  text-align: right;
  user-select: text;
  cursor: text;
}

.total {
  margin-top: 12px;
  padding-top: 12px;
  font-weight: 500;
  border-top: 2px var(--request-timings-total-border-color, rgba(255, 255, 255, 0.74)) solid;
}

.row.is-total {
  justify-content: flex-end;
}

:host([narrow]) .row {
  flex-direction: column;
  align-items: start;
  margin: 8px 0;
}

:host([narrow]) anypoint-progress {
  width: 100%;
  flex: auto;
  order: 3;
}

:host([narrow]) .timing-value {
  text-align: left;
  order: 2;
}

:host([narrow]) .timing-label {
  order: 1;
  width: auto;
}
`;
