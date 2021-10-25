import { css } from 'lit-element';

export default css`
:host {
  display: block;
}

.sub-page-arrow {
  transform: rotate(-90deg);
}

.settings-group {
  padding: 12px;
  border: 1px var(--settings-group-border, #e5e5e5) solid;
  border-radius: 8px;
  margin: 40px 0; 
}

.settings-title {
  font-size: 1.6rem;
  font-weight: 300;
  margin: 1em 12px;
}

.settings-description {
  margin: 1em 12px;
}

.title-line {
  display: flex;
  align-items: center;
}

anypoint-input[type="text"],
anypoint-masked-input[type="text"] {
  width: 100%;
  margin: 12px 0;
}

.setting-section {
  margin: 24px 0;
  border-bottom: 1px rgba(0, 0, 0, var(--dark-divider-opacity, .12)) dashed;
  padding-bottom: 24px;
}

.setting-section:last-of-type {
  border-bottom: none;
  padding-bottom: 0;
}

.setting-section-title {
  font-size: 1.1rem;
  margin: 0px 12px 12px 12px;
  color: var(--primary-text-color, unset);
}

.setting-section-description {
  margin: 0px 12px 20px 12px;
  color: var(--secondary-text-color, rgba(0, 0, 0, 0.78));
}
`;
