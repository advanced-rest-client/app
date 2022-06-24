import { css } from 'lit';

export default css`:host {
  display: flex;
  flex-direction: column;
  color: var(--exchange-search-panel-font-color, inherit);
}

.header {
  display: flex;
  flex-direction: row;
  align-items: center;
}

h2 {
  font-size: var(--arc-font-headline-font-size);
  font-weight: var(--arc-font-headline-font-weight);
  letter-spacing: var(--arc-font-headline-letter-spacing);
  line-height: var(--arc-font-headline-line-height);
  flex: 1;
}

[hidden] {
  display: none !important;
}

progress {
  width: 100%;
}

anypoint-icon-button.toggle-view {
  border-radius: 50%;
  min-width: 40px;
  min-height: 40px;
}

.empty-info {
  font-size: 16px;
}

.header-actions {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.search-bar {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.search-bar anypoint-input {
  flex: 1;
}

.list-wrapper {
  color: inherit;
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.list {
  color: inherit;
}

.list.grid {
  display: grid;
  column-gap: 8px;
  row-gap: 8px;
}

.list:not(.grid) {
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
}

.load-more {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
}

.auth-button {
  margin-right: 8px;
}

.exchange-icon {
  margin-right: 8px;
}

.connecting-info {
  width: 320px;
  margin: 0 auto;
  text-align: center;
}

.icon {
  display: block;
  width: 24px;
  height: 24px;
  fill: currentColor;
}

.card {
  padding: 12px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  border: 1px #e5e5e5 solid;
  border-radius: 3px;
}

.name {
  font-size: var(--arc-font-subhead-font-size);
  font-weight: var(--arc-font-subhead-font-weight);
  line-height: var(--arc-font-subhead-line-height);
  padding: 0;
  margin: 0;
}

.list-item .name {
  display: inline-block;
  margin-right: 16px;
  -webkit-margin-before: 0.35em;
}

.title {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
}

.card .content {
  flex: 1;
}

.creator {
  color: var(--exchange-search-list-item-author-color, rgba(0, 0, 0, 0.64));
}

star-rating {
  display: inline-block;
}

.thumb {
  display: block;
  min-width: 40px;
  width: 40px;
  height: 40px;
  margin-right: 8px;
  background-size: cover;
}

.default-icon {
  fill: currentColor;
}

.list-item .thumb {
  min-width: 32px;
  width: 32px;
  height: 32px;
}

.meta {
  margin: 0;
  padding: 0;
  margin-right: 12px;
}

.details {
  display: flex;
  flex-direction: row;
}

.top-line {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.list-item,
.grid-item {
  color: var(--exchange-search-panel-item-card-color, inherit);
  background-color: var(--exchange-search-panel-item-background-color, inherit);
}
`;
