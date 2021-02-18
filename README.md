# nextjs-fastify-auth

Keywords:
- fastify
- rest
- Next.js
- JWT
- Cookies
- Login/Logout

## Issue

See https://github.com/nextauthjs/next-auth/issues/1337 for more details, notice the rad issue number!

To reproduce the issue:
- Start the fastify/next.js server with `npm start`
- Open browser, navigate to http://localhost:3333/index
- Press "Sign in", now enter any username paassword and press the "Sign in with DEMO LOGIN"
- -> request never ends