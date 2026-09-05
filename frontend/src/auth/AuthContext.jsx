import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useApolloClient } from "@apollo/client/react";
import {
  LOGIN_MUTATION,
  ME_QUERY,
  REGISTER_MUTATION,
} from "../graphql.js";

const STORAGE_KEY = "postly.session";
const AuthContext = createContext(null);

function readStoredSession() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return value?.token ? value : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const apolloClient = useApolloClient();
  const [session, setSession] = useState(readStoredSession);
  const [booting, setBooting] = useState(Boolean(session?.token));

  function saveSession(nextSession) {
    setSession(nextSession);
    if (nextSession) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  useEffect(() => {
    if (!session?.token) {
      setBooting(false);
      return undefined;
    }

    let active = true;
    apolloClient
      .query({ query: ME_QUERY, fetchPolicy: "network-only" })
      .then(({ data }) => {
        if (active) saveSession({ token: session.token, user: data.me });
      })
      .catch(() => {
        if (active) saveSession(null);
      })
      .finally(() => {
        if (active) setBooting(false);
      });

    return () => {
      active = false;
    };
  }, [apolloClient, session?.token]);

  const value = useMemo(
    () => ({
      booting,
      token: session?.token ?? null,
      user: session?.user ?? null,
      login: async (identifier, password) => {
        const { data } = await apolloClient.mutate({
          mutation: LOGIN_MUTATION,
          variables: { identifier, password },
        });
        await apolloClient.clearStore();
        saveSession(data.login);
        return data.login.user;
      },
      register: async (input) => {
        const { data } = await apolloClient.mutate({
          mutation: REGISTER_MUTATION,
          variables: { input },
        });
        await apolloClient.clearStore();
        saveSession(data.register);
        return data.register.user;
      },
      logout: () => {
        saveSession(null);
        void apolloClient.clearStore();
      },
    }),
    [apolloClient, booting, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
