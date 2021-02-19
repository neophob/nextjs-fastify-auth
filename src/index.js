const debug = require('debug')('demo:index');
const rest = require('./lib/rest');

const listenPort = process.env.PORT || 3333;
debug('start REST server on port', listenPort);
rest.startServer(listenPort);

process.on('unhandledRejection', (err) => {
  debug('not good...', err);
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
