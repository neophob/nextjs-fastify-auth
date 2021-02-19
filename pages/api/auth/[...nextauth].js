import NextAuth from 'next-auth';
import Providers from 'next-auth/providers';

// see https://next-auth.js.org/configuration/options#events
const options = {
  providers: [
    Providers.Credentials({
      // The name to display on the sign in form (e.g. 'Sign in with...')
      name: 'DEMO LOGIN',
      // The credentials is used to generate a suitable form on the sign in page.
      // You can specify whatever fields you are expecting to be submitted.
      // e.g. domain, username, password, 2FA token, etc.
      credentials: {
        username: { label: "Username", type: "text", placeholder: "jsmith" },
        password: { label: "Password", type: "password" }
      },
       async authorize(credentials) {
        console.log('authorizeauthorize');

        // Add logic here to look up the user from the credentials supplied
        const user = { id: 1, name: 'J Smith', email: 'jsmith@example.com' }

        if (user) {
          // Any object returned will be saved in `user` property of the JWT
          return (user)
        } else {
          // If you return null or false then the credentials will be rejected
          return (null)
          // You can also Reject this callback with an Error or with a URL:
          // throw new Error('error message') // Redirect to error page
          // throw '/path/to/redirect'        // Redirect to a URL
        }
      }
    })
  ],
  secret: 'this is a string that i should set an maybe use an env variable',
  callbacks: {
    async authorize(user, account, profile) {
      console.log('CB:authorize', {user, account, profile});
      return true
    },
    async signIn(user, account, profile) {
      console.log('CB:signIn', {user, account, profile});
      const isAllowedToSignIn = true
      if (isAllowedToSignIn) {
        return true
      }
    },
    async jwt(token, user, account, profile, isNewUser) {
      console.log('CB:JWT', {token, user, account, profile, isNewUser})
      // Add access_token to the token right after signin
      if (account?.accessToken) {
        token.accessToken = account.accessToken
      }
      return token
    },
    async session(session, token) {
      console.log('CB:SESSION!', {token, user, account, profile, isNewUser})
      if(token?.accessToken) {
        // Add property to session, like an access_token from a provider
        session.accessToken = token.accessToken
      }
      return session
    },
    async redirect(url, baseUrl) {
      console.log('CB:REDIRECT!', {url, baseUrl})
      return url.startsWith(baseUrl)
        ? url
        : baseUrl
    }
  },
  session: {
    jwt: true,
    // Seconds - How long until an idle session expires and is no longer valid.
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
/*  pages: {
    //signIn: '/auth2/signin',
  },*/
  events: {
    async signIn(message) { console.log('EVT signIn', message); },
    async signOut(message) { console.log('EVT signOut', message); },
    async createUser(message) { console.log('EVT createUser', message); },
    async linkAccount(message) { console.log('EVT linkAccount', message); },
    async session(message) { console.log('EVT session', message);},
    async error(message) { console.log('EVT error', message); }
  },
  debug: true,

};

export default (req, res) => NextAuth(req, res, options);
