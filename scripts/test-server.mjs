import { dev } from 'astro';

// Keep the server in Playwright's process tree, bypassing CLI agent detection.
const server = await dev({
  root: new URL('../', import.meta.url),
  server: { host: '127.0.0.1', port: 4322 },
  vite: { server: { strictPort: true } },
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, async () => {
    await server.stop();
    process.exit(0);
  });
}
