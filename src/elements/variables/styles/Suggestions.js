import { css } from 'lit-element';

export default css`
:host {
  display: block;
  position: absolute;
  padding: 12px 0px;
  box-shadow: var(--anypoint-autocomplete-dropdown-shadow);
  background-color: var(--primary-background-color, #fff);
  overflow: auto;
}

.highlight {
  font-weight: 500;
}

.section-label {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: var(--lits-subhead-item-padding, var(--anypoint-item-padding, 0px 12px));
  min-height: var(--lits-subhead-item-min-height, var(--anypoint-item-min-height, 48px));
  font-size: var(--lits-subhead-font-size, 0.9rem);
  font-weight: var(--lits-subhead-font-weight, 500);
}

.empty-info {
  padding: var(--lits-empty-info-padding, var(--anypoint-item-padding, 0px 12px));
}
`;
