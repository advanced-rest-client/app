/* eslint-disable no-plusplus */
import http from 'http';
import fs from 'fs/promises';
import { AnypointMock } from './AnypointMock.mjs';

/** @typedef {import('net').Socket} Socket */
/** @typedef {import('http').IncomingMessage} IncomingMessage */
/** @typedef {import('http').ServerResponse} ServerResponse */
/** @typedef {import('../src/types').ExchangeAsset} ExchangeAsset */

export class ExchangeApi {
  constructor() {
    this.connectionHandler = this.connectionHandler.bind(this);
    this.requestHandler = this.requestHandler.bind(this);
    /** @type Socket[] */
    this.clients = [];
    this.mock = new AnypointMock();
    /** @type number */
    this.port = undefined;
  }

  /**
   * @param {number} port
   */
  start(port) {
    this.port = port;
    return new Promise((resolve) => {
      const server = http.createServer(this.requestHandler);
      this.server = server;
      server.once('close', () => {
        this.server = undefined;
      });
      server.on('connection', this.connectionHandler);
      server.listen(port, () => {
        resolve();
      });
    });
  }

  async stop() {
    if (!this.server) {
      return undefined;
    }
    this.clients.forEach((s) => {
      if (!s.destroyed) {
        s.destroy();
      }
    });
    this.clients = [];
    return new Promise((resolve) => {
      this.server.close(() => resolve());
    });
  }

  /**
   * @param {Socket} socket 
   */
  connectionHandler(socket) {
    this.clients.push(socket);
    socket.on('close', () => {
      const index = this.clients.indexOf(socket);
      this.clients.splice(index, 1);
    });
  }

  /**
   * @param {IncomingMessage} req 
   * @param {ServerResponse} res 
   */
  requestHandler(req, res) {
    this.addCors(res);
    const { authorization } = req.headers;
    if (authorization === 'Bearer expired') {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'Session expired'
      }));
      return;
    }
    if (req.url.startsWith('/assets')) {
      this.respondAssetsList(res);
    } else if (req.url.startsWith('/partial/assets')) {
      this.respondAssetsList(res, 10);
    } else if (req.url.startsWith('/download')) {
      this.downloadAsset(res);
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'Unknown path'
      }));
    }
  }

  /**
   * @param {ServerResponse} res 
   */
  async downloadAsset(res) {
    const file = await fs.readFile('test/exchange-search/api.zip');
    res.statusCode = 200;
    res.setHeader('content-type', 'application/zip');
    res.setHeader('content-length', Buffer.byteLength(file));
    res.end(200);
  }

  /**
   * @param {number} size The number of results in the response.
   * @param {ServerResponse} res 
   */
  respondAssetsList(res, size) {
    const result = this.mock.exchangeAssetsList(this.port, size);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result));
  }

  /**
   * @param {ServerResponse} res 
   */
  addCors(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'authorization');
  }
}

const instance = new ExchangeApi();

export async function startServer(port=8987) {
  await instance.start(port);
}

export async function stopServer() {
  await instance.stop();
}
