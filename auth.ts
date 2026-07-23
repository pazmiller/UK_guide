import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';

function getAdminLogins()
{
  return new Set(
    ( process.env.ADMIN_GITHUB_LOGINS ?? '' )
      .split( ',' )
      .map( login => login.trim().toLowerCase() )
      .filter( Boolean ),
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth( {
  providers: [ GitHub ],
  callbacks: {
    signIn( { profile } )
    {
      const login = typeof profile?.login === 'string' ? profile.login.toLowerCase() : '';
      return Boolean( login && getAdminLogins().has( login ) );
    },
    jwt( { token, profile } )
    {
      if ( typeof profile?.login === 'string' ) token.githubLogin = profile.login;
      return token;
    },
    session( { session, token } )
    {
      if ( session.user && typeof token.githubLogin === 'string' )
      {
        session.user.githubLogin = token.githubLogin;
      }
      return session;
    },
  },
} );
