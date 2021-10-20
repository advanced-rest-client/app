import { SessionCookieEventTypes } from "@advanced-rest-client/events";

export const CookieStub = {};
CookieStub.listHandler = undefined;

CookieStub.mockBridge = (cookies) => {
  CookieStub.listHandler = (e) => {
    e.preventDefault();
    e.detail.result = Promise.resolve(cookies);
  };
  window.addEventListener(SessionCookieEventTypes.listAll, CookieStub.listHandler);
};

CookieStub.stop = () => {
  window.removeEventListener(SessionCookieEventTypes.listAll, CookieStub.listHandler);
};
