export declare interface ExchangeAsset {
  groupId: string;
  assetId: string;
  version: string;
  versionGroup?: string;
  productAPIVersion?: string;
  isPublic: boolean;
  name: string;
  type: string;
  status: string;
  assetLink: string;
  createdAt: string;
  runtimeVersion: string;
  rating?: number;
  numberOfRates?: number;
  id: string;
  icon?: string;
  modifiedAt?: string;
  organization: AssetOrganization;
  createdBy: AssetCreatedBy;
  tags?: any[];
  files: AssetFile[];
}

export declare interface AssetCreatedBy {
  firstName: string;
  id: string;
  lastName: string;
  userName: string;
}

export declare interface AssetFile {
  classifier: string;
  createdDate: string;
  externalLink: string;
  isGenerated: boolean;
  mainFile: string;
  md5: string;
  packaging: string;
  sha1: string;
}

export declare interface AssetOrganization {
  domain: string;
  id: string;
  isMaster: boolean;
  isMulesoftOrganization: boolean;
  name: string;
  parentOrganizationIds: string[];
  subOrganizationIds: string[];
  tenantOrganizationIds: string[];
}

export declare interface MediaQueryInfo {
  query: string;
  value: number;
}

export declare interface MediaQueryResult extends MediaQueryInfo {
  matches: boolean;
}

export declare interface MediaQueryItem {
  mq: MediaQueryList;
  listener: (e: MediaQueryListEvent) => any;
}
