import Digest from './Digest';
import HttpBasic from './HttpBasic';
import HttpBearer from './HttpBearer';
import Ntlm from './Ntlm';
import OAuth1 from './OAuth1';
import OAuth2 from './OAuth2';
import OpenID from './OpenID';
import ClientCertificate from './ClientCertificate.js';
import AuthorizationMethodElement from '../AuthorizationMethodElement';
import CcAuthorizationMethodElement from '../CcAuthorizationMethodElement';
import { AuthUiInit } from '../types';

export class UiDataHelper {
  static setupBasic(element: AuthorizationMethodElement, init: AuthUiInit): HttpBasic;
  static setupBearer(element: AuthorizationMethodElement, init: AuthUiInit): HttpBearer;
  static setupNtlm(element: AuthorizationMethodElement, init: AuthUiInit): Ntlm;
  static setupDigest(element: AuthorizationMethodElement, init: AuthUiInit): Digest;
  static setDigestValues(i: Digest, element: AuthorizationMethodElement): void;
  static setupOauth1(element: AuthorizationMethodElement, init: AuthUiInit): OAuth1;
  static setupOauth2(element: AuthorizationMethodElement, init: AuthUiInit): OAuth2;
  static setOAuth2Values(i: OAuth2, element: AuthorizationMethodElement): void;
  static setupOidc(element: AuthorizationMethodElement, init: AuthUiInit): OpenID;
  static populateBasic(element: AuthorizationMethodElement, ui: HttpBasic): void;
  static populateBearer(element: AuthorizationMethodElement, ui: HttpBearer): void;
  static populateNtlm(element: AuthorizationMethodElement, ui: Ntlm): void;
  static populateDigest(element: AuthorizationMethodElement, ui: Digest): void;
  static populateOAuth1(element: AuthorizationMethodElement, ui: OAuth1): void;
  static populateOAuth2(element: AuthorizationMethodElement, ui: OAuth2): void;
  static populateOpenId(element: AuthorizationMethodElement, ui: OpenID): void;
  static setupClientCertificate(element: CcAuthorizationMethodElement, init: AuthUiInit): ClientCertificate;
  static populateClientCertificate(element: CcAuthorizationMethodElement, ui: ClientCertificate): void;
}
