# BABYTHENK NRO proxy for Render

Deploy as a new Render Web Service from your own GitHub repository.

- Language: Node
- Build Command: `npm install`
- Start Command: `npm start`
- Instance: Free (if available)
- Root Directory: blank

Check `https://YOUR-SERVICE.onrender.com/health`.

In J2ME4W settings, use Proxy URL `https://YOUR-SERVICE.onrender.com/__j2me4w`.

This proxy allows TCP connections ONLY to 103.238.235.238:10036.
HTTP proxying is intentionally disabled.
A successful /health check does NOT prove TCP reachability.
Render free instances may sleep and interrupt gameplay.
