const fastify = require('fastify')({ logger: process.env.FASTIFYLOG_ENABLED === 'true' });
const fastifyJwt = require('fastify-jwt');
const fastifyNextJs = require('fastify-nextjs');
const fastifyCookie = require('fastify-cookie');
const debug = require('debug')('demo:rest');

fastify.register(require('fastify-formbody'));

const cookieJwtKey = 'token';
const mimeTypeJson = 'application/json; charset=utf-8';
const tokenExpiresIn = process.env.TOKEN_EXPIRES || '1h';

module.exports = {
  startServer,
};

/**
 * starts rest service
 * @param {*} listenPort
 * @returns {Promise} if server is started
 */
function startServer(listenPort) {
  debug('start REST server %o', { tokenExpiresIn });
  installNextJs();
  installJWT(process.env.SECRET);

  fastify.get('/scheduler', (req, reply) => {
    const token = req.cookies[cookieJwtKey];
    const decodedToken = fastify.jwt.decode(token).payload;
    const username = decodedToken.user;
    reply
      .code(200)
      .header('Content-Type', mimeTypeJson)
      .send({ foo: 123});
  });

  return fastify.listen(listenPort, '::').then((address) => {
    debug(`> Server listening on ${address}`);
  });
}

function installNextJs() {
  fastify
    .register(fastifyNextJs, { dev: true, logLevel: 'debug' })
    .after(() => {
      fastify.next('/api/*', { method: 'get' });
      fastify.next('/api/*', { method: 'post' });
      fastify.next('/index');
    });
}

function installJWT(secret) {
  if (!secret) {
    throw new Error('NO_SECRET_ENV_VARIABLE');
  }

  fastify.register(fastifyCookie);
  fastify.register(fastifyJwt, {
    secret,
    cookie: {
      cookieName: cookieJwtKey,
    },
  });

  const loginSchema = {
    body: {
      type: 'object',
      required: ['username', 'password'],
      properties: {
        username: { type: 'string' },
        password: { type: 'string' },
      },
    },
  };

  async function handleLogin(req, reply) {
    debug('handleLogin!', req.body.username);
    const username = req.body.username;
    const password = req.body.password;
    const dbRecord = { id: 1, name: username}
    if (!dbRecord || !dbRecord.id || dbRecord.name !== username) {
      reply
        .code(500)
        .clearCookie(cookieJwtKey)
        .header('Content-Type', mimeTypeJson)
        .send({ error: 'Login failed' });
      return;
    }

    const payload = {
      user: username,
      id: dbRecord.id,
      created: Date.now(),
    };
    const token = fastify.jwt.sign(
      { payload },
      { expiresIn: tokenExpiresIn },
    );
    debug('JWT_LOGIN SUCCEEDED', { payload });
    reply
      .setCookie(cookieJwtKey, token, { httpOnly: true, sameSite: true })
      .send({ token });
  }

  fastify.post('/login', { schema: loginSchema }, async (req, reply) => {
    await handleLogin(req, reply);
  });

  fastify.post('/logout', (req, reply) => {
    reply
      .clearCookie(cookieJwtKey)
      .send('logout');
  });

  fastify.addHook('onRequest', async (req, reply) => {
    const requestUrl = req.url;
    // only one protected url!
    if (requestUrl.toLowerCase() !== '/scheduler') {
      return;
    }

    // ok here we need a valid token!
    debug('JWT_ON_REQUEST', req.url, req.cookies.token);
    try {
      await req.jwtVerify();
    } catch (err) {
      debug('JWT_ERROR', err.message);
      reply.send(err);
    }
  });

}
