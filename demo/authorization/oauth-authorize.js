import '@anypoint-web-components/awc/anypoint-input.js';
import '@anypoint-web-components/awc/anypoint-button.js';
import '@anypoint-web-components/awc/anypoint-masked-input.js';
import { v4 } from '@advanced-rest-client/uuid';

function setupFormAction() {
  const u = new URL(window.location.href)
  const state = u.searchParams.get('state');
  const redirectUri = decodeURIComponent(u.searchParams.get('redirect_uri'));
  const type = u.searchParams.get('response_type');
  const codeParam = type === 'code' ? 'code' : 'access_token';
  const params = new URLSearchParams();
  params.set(codeParam, v4());
  params.set('state', state);
  params.set('expires_in', '3600');
  params.set('scope', 'dummy');
  if (type !== 'code') {
    params.set('token_type', 'bearer');
    params.set('refresh_token', v4());
  }
  const formUrl = `${redirectUri}#${params.toString()}`;
  const form = document.querySelector('form');
  form.action = formUrl;
}

function loginHandler() {
  const form = document.querySelector('form');
  window.location.assign(form.action);
}

function addButtonAction() {
  const button = document.querySelector('.login-button');
  button.addEventListener('click', loginHandler);
}

function initialize() {
  setupFormAction();
  addButtonAction();
}

initialize();
