import getPort from 'get-port';
import chalk from 'chalk';
import { startServer } from './WSServer.mjs';

(async () => {
  const wsPort = await getPort({ port: getPort.makeRange(8000, 8100) });
  await startServer(wsPort);
  console.clear();
  console.group();
  console.log(chalk.bold('Web socket server is running'));
  console.log('');
  console.log(`${chalk.white('url:')} ${chalk.cyanBright(`ws://localhost:${wsPort}`)}`);
  console.groupEnd();
  console.log('');
})();
