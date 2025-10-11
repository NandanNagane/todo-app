applyTo: "backend/**/*.js"

#Custom instructions for copilot

This project uses javascipt with following styles:

#Coding style

-Use ES Modules exclusively for all JavaScript in this repository. Prefer import ... from 'pkg' and export default / named exports. Do not use require(), module.exports, __dirname, or __filename. For paths, use import.meta.url with fileURLToPath and path.dirname.

-When a dependency only publishes CommonJS, load it with dynamic import() and read its default export when applicable: const m = await import('pkg'); const api = m.default ?? m. Avoid require().

-Express usage: import express from 'express'; const app = express(); prefer ESM-friendly   middleware patterns.

Keep all new source files in ESM. If a tool requires CommonJS for its config, isolate it using a .cjs config file; application code remains ESM.

Use URL-safe paths where possible: new URL('./relative', import.meta.url) and fileURLToPath for filesystem operations