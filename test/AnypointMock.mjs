/* eslint-disable no-plusplus */
import { ArcMock } from '@advanced-rest-client/arc-mock';

/** @typedef {import('../src/types').ExchangeAsset} ExchangeAsset */
/** @typedef {import('../src/types').AssetOrganization} AssetOrganization */
/** @typedef {import('../src/types').AssetFile} AssetFile */

export class AnypointMock {
  constructor() {
    this.mock = new ArcMock();
  }

  /**
   * @param {number} port The port number to use in the asset's files URLs.
   * @param {number} size The number of items on the list.
   * @returns {ExchangeAsset[]}
   */
  exchangeAssetsList(port, size=30) {
    const result = [];
    for (let i = 0; i < size; i++) {
      result.push(this.exchangeAsset(port));
    }
    return result;
  }

  /**
   * @param {number} port The port number to use in the asset's files URLs.
   * @returns {ExchangeAsset}
   */
  exchangeAsset(port) {
    const id = this.mock.types.uuid();
    const organization = this.exchangeOrganization();
    const file = this.exchangeFile(id, port);
    const obj = /** @type ExchangeAsset */ ({
      name: this.mock.lorem.words(2),
      tags: [],
      rating: this.mock.types.number({ min: 0, max: 5 }),
      organization,
      files: [file],
      id,
      assetId: this.mock.types.uuid(),
      groupId: this.mock.types.uuid(),
      assetLink: this.mock.internet.uri(),
      isPublic: this.mock.types.boolean(),
      type: 'rest-api',
      version: '1.0.0',
      status: '',
    });
    return obj;
  }

  /**
   * @returns {AssetOrganization}
   */
  exchangeOrganization() {
    const org = /** @type AssetOrganization */ ({
      name: this.mock.lorem.words(2),
      domain: this.mock.internet.domain(),
      id: this.mock.types.uuid(),
      isMaster: this.mock.types.boolean(),
      isMulesoftOrganization: this.mock.types.boolean(),
      parentOrganizationIds: [],
      subOrganizationIds: [],
      tenantOrganizationIds: [],
    });
    return org;
  }

  /**
   * @param {string} id The asset id.
   * @param {number} port The port number to use in the URL.
   * @returns {AssetFile}
   */
  exchangeFile(id, port) {
    const file = /** @type AssetFile */ ({
      classifier: 'raml',
      externalLink: `http://localhost:${port}/download/${id}`,
      isGenerated: false,
      mainFile: 'api.raml',
      md5: this.mock.types.hash(),
    });
    return file;
  }
}
