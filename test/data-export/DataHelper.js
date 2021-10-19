/* eslint-disable arrow-body-style */
import { DataGenerator } from '@advanced-rest-client/arc-data-generator';

/** @typedef {import('@advanced-rest-client/arc-types').DataExport.ArcExportObject} ArcExportObject */
/** @typedef {import('@advanced-rest-client/arc-types').DataExport.ExportArcHistoryRequest} ExportArcHistoryRequest */
/** @typedef {import('@advanced-rest-client/arc-types').DataExport.ExportArcCookie} ExportArcCookie */
/** @typedef {import('@advanced-rest-client/arc-types').DataExport.ExportArcVariable} ExportArcVariable */
/** @typedef {import('@advanced-rest-client/arc-types').DataExport.ExportArcUrlHistory} ExportArcUrlHistory */
/** @typedef {import('@advanced-rest-client/arc-types').DataExport.ExportArcWebsocketUrl} ExportArcWebsocketUrl */
/** @typedef {import('@advanced-rest-client/arc-types').DataExport.ExportArcAuthData} ExportArcAuthData */

const generator = new DataGenerator();

export const DataHelper = {};
/**
 * @return {File}
 */
DataHelper.generateArcImportFile = () => {
  const data = `{
    "createdAt": "2019-02-02T21:58:25.467Z",
    "version": "13.0.0-alpha.3",
    "kind": "ARC#Import",
    "requests": []
  }`;
  const file = /** @type File */ (new Blob([data], { type: 'application/json' }));
  // @ts-ignore
  file.name = 'arc-export.json';
  // @ts-ignore
  file.lastModified = Date.now();
  return file;
};

DataHelper.generateElectronBuffer = () => {
  const data = `{
    "createdAt": "2019-02-02T21:58:25.467Z",
    "version": "13.0.0-alpha.3",
    "kind": "ARC#Import",
    "requests": [{}]
  }`;
  const uint8 = new Uint8Array([10, 20, 30, 40, 50]);
  uint8.toString = () => {
    return data;
  };
  return uint8;
};

/**
 * @return {File}
 */
DataHelper.generateRamlUnknownFile = () => {
  const data = `#%RAML 1.0
  baseUri: https://api.domain.com
  `;
  const file = /** @type File */ (new Blob([data]));
  return file;
};
/**
 * @return {File}
 */
DataHelper.generateOas2JsonUnknownFile = () => {
  const data = `{"swagger": true}`;
  const file = /** @type File */ (new Blob([data]));
  return file;
};
/**
 * @return {File}
 */
DataHelper.generateJsonErrorFile = () => {
  const data = `{swagger: true}`;
  const file = /** @type File */ (new Blob([data]));
  return file;
};

/**
 * @return {ArcExportObject}
 */
DataHelper.generateSingleRequestImport = () => {
  return {
    requests: [{
      key: '11013905-9b5a-49d9-adc8-f76ec3ead2f1',
      kind: 'ARC#HttpRequest',
      updated: 1545502958053,
      created: 1545363890469,
      headers: 'Content-Type: application/json\nContent-Length: 2',
      method: 'POST',
      payload: '{}',
      url: 'https://www.domain.com/customers',
      name: 'test',
      type: 'saved',
    }],
    createdAt: '2019-02-02T21:58:25.467Z',
    version: '13.0.0',
    kind: 'ARC#Import'
  };
};

/**
 * @return {ArcExportObject}
 */
DataHelper.generateMultiRequestImport = () => {
  return {
    requests: [{
      key: '11013905-9b5a-49d9-adc8-f76ec3ead2f1',
      kind: 'ARC#HttpRequest',
      updated: 1545502958053,
      created: 1545363890469,
      headers: 'Content-Type: application/json\nContent-Length: 2',
      method: 'POST',
      payload: '{}',
      url: 'https://www.domain.com/customers',
      name: 'test1',
      type: 'saved',
    }, {
      key: '20013905-9b5a-49d9-adc8-f76ec3ead2f1',
      kind: 'ARC#HttpRequest',
      updated: 1545502958057,
      created: 1545363890464,
      headers: 'Content-Type: application/json\nContent-Length: 2',
      method: 'POST',
      payload: '{}',
      url: 'https://www.domain.com/other',
      name: 'test2',
      type: 'saved',
    }],
    createdAt: '2019-02-02T21:58:25.467Z',
    version: '13.0.0',
    kind: 'ARC#Import'
  };
};

/**
 * @return {ArcExportObject}
 */
DataHelper.generateProjectImportOpen = () => {
  return {
    requests: [{
      key: '11013905-9b5a-49d9-adc8-f76ec3ead2f1',
      kind: 'ARC#HttpRequest',
      updated: 1545502958053,
      created: 1545363890469,
      headers: 'Content-Type: application/json\nContent-Length: 2',
      method: 'POST',
      payload: '{}',
      url: 'https://www.domain.com/customers',
      projects: ['24550674-868e-411c-9359-09e59c91956c'],
      name: 'test',
      type: 'saved',
    }],
    projects: [{
      order: 0,
      requests: ['11013905-9b5a-49d9-adc8-f76ec3ead2f1'],
      name: 'Response actions',
      updated: 1549390841631,
      created: 1549390841631,
      kind: 'ARC#ProjectData',
      key: '24550674-868e-411c-9359-09e59c91956c'
    }],
    loadToWorkspace: true,
    createdAt: '2019-02-02T21:58:25.467Z',
    version: '13.0.0',
    kind: 'ARC#Import'
  };
};

/** 
 * @param {string} file
 * @returns {Promise<string>}
*/
DataHelper.getFile = async (file) => {
  const response = await fetch(`/test/data/${file}`);
  if (!response.ok) {
    throw new Error(`File ${file} is unavailable`);
  }
  return response.text();
};

function mapExportKeys(item) {
  item.key = item._id;
  delete item._id;
  delete item._rev;
  return item;
}

/**
 * @returns {ArcExportObject}
 */
DataHelper.generateExportData = () => {
  const saved = generator.generateSavedRequestData({
    requestsSize: 10,
    projectsSize: 2,
    forceProject: true,
  });
  const historyData = /** @type ExportArcHistoryRequest[] */ (generator.generateHistoryRequestsData({
    requestsSize: 10
  })).map(mapExportKeys);
  const certs = generator.generateExportClientCertificates({
    size: 2,
  }).map(mapExportKeys);
  return {
    kind: 'ARC#Import',
    createdAt: '2017-09-28T19:43:09.491',
    version: '9.14.64.305',
    requests: saved.requests.map(mapExportKeys),
    projects: saved.projects.map(mapExportKeys),
    history: historyData,
    variables: /** @type ExportArcVariable[] */ (generator.generateVariablesData().map(mapExportKeys)),
    cookies: /** @type ExportArcCookie[] */ (generator.generateCookiesData().map(mapExportKeys)),
    urlhistory: /** @type ExportArcUrlHistory[] */ (generator.generateUrlsData({
      size: 10
    }).map(mapExportKeys)),
    websocketurlhistory: /** @type ExportArcWebsocketUrl[] */ (generator.generateUrlsData({
      size: 5
    }).map(mapExportKeys)),
    authdata: /** @type ExportArcAuthData[] */ (generator.generateBasicAuthData().map(mapExportKeys)),
    clientcertificates: certs,
  };
};
