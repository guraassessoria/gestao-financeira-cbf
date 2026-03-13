const http = require('http');
const { performance } = require('perf_hooks');

function hit(path) {
  return new Promise((resolve) => {
    const start = performance.now();
    const req = http.request({ host: 'localhost', port: 3000, path, method: 'GET' }, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve({ status: res.statusCode, ms: performance.now() - start, len: data.length }));
    });
    req.on('error', (e) => resolve({ status: 0, ms: performance.now() - start, err: e.message }));
    req.end();
  });
}

(async () => {
  const p = '/api/dre?periodo=2025&visao=mensal';
  const a = await hit(p);
  const b = await hit(p);
  console.log({ first: a, second: b });
})();
