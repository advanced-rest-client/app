import { css } from 'lit-element';

export default css`
:host {
  display: bloc;
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