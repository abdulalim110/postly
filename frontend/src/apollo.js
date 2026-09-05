import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
} from "@apollo/client";

const STORAGE_KEY = "postly.session";

function readAccessToken() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY))?.token ?? null;
  } catch {
    return null;
  }
}

const authLink = new ApolloLink((operation, forward) => {
  const token = readAccessToken();

  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  }));

  return forward(operation);
});

const httpLink = new HttpLink({ uri: "/graphql" });

export const apolloClient = new ApolloClient({
  link: ApolloLink.from([authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          feed: { merge: false },
        },
      },
    },
  }),
});
