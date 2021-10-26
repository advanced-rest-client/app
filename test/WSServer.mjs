import { WebSocketServer } from 'ws';
import { ArcMock } from '@advanced-rest-client/arc-mock';

class Server {
  constructor() {
    this.connectionHandler = this.connectionHandler.bind(this);
    this.mock = new ArcMock();
  }

  /**
   * @param {number} port
   */
  start(port) {
    return new Promise((resolve) => {
      this.wss = new WebSocketServer({ port }, () => {
        resolve();
      });
      this.wss.on('close', () => {
        this.wss = undefined;
      });
      this.wss.on('connection', this.connectionHandler);
    });
  }

  async stop() {
    if (!this.wss) {
      return undefined;
    }
    this.wss.clients.forEach(c => c.terminate());
    return new Promise((resolve) => {
      this.wss.close(() => resolve());
    });
  }

  connectionHandler(ws) {
    ws.on('message', (data, binary) => this.handleMessage(ws, data, binary));
  }

  /**
   * @param {import('ws')} ws
   * @param {Buffer} data
   * @param {boolean} binary
   */
  handleMessage(ws, data, binary) {
    if (binary) {
      ws.send(data, { binary });
      return;
    }
    try {
      const str = data.toString('utf8');
      const info = JSON.parse(str);
      if (info.action) {
        this.handleAction(ws, info.action);
      } else {
        ws.send(data, { binary });
      }
    } catch (e) {
      ws.send(data, { binary });
    }
  }

  /**
   * @param {import('ws')} ws
   * @param {string} action
   */
  handleAction(ws, action) {
    switch (action) {
      case 'json': ws.send(this.generateJsonData()); break;
      default: ws.send('Unknown action');
    }
  }

  /**
   * @return {string} The generates JSON of an HTTP response.
   */
  generateJsonData() {
    const data = this.mock.http.response.response();
    return JSON.stringify(data);
  }
}

const instance = new Server();

export async function startServer(port=8987) {
  await instance.start(port);
}

export async function stopServer() {
  await instance.stop();
}
