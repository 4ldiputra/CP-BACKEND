const net = require('net');

const host = process.env.MYSQL_HOST || 'db';
const port = parseInt(process.env.MYSQL_PORT || '3306', 10);
const timeoutSeconds = parseInt(process.env.DB_WAIT_TIMEOUT || '60', 10);

function checkOnce() {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let done = false;
    socket.setTimeout(2000);
    socket.on('connect', () => {
      done = true;
      socket.destroy();
      resolve(true);
    });
    socket.on('timeout', () => {
      if (!done) {
        done = true;
        socket.destroy();
        resolve(false);
      }
    });
    socket.on('error', () => {
      if (!done) {
        done = true;
        socket.destroy();
        resolve(false);
      }
    });
    socket.connect(port, host);
  });
}

(async function waitForDb() {
  process.stdout.write(`Waiting for DB ${host}:${port}`);
  const start = Date.now();
  while ((Date.now() - start) / 1000 < timeoutSeconds) {
    // eslint-disable-next-line no-await-in-loop
    const ok = await checkOnce();
    if (ok) {
      console.log('\nDB reachable');
      process.exit(0);
    }
    process.stdout.write('.');
    // eslint-disable-next-line no-await-in-loop
    await new Promise((r) => setTimeout(r, 1000));
  }
  console.error('\nTimed out waiting for DB');
  process.exit(1);
})();
