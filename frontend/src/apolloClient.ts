import {
  ApolloClient,
  InMemoryCache,
  ApolloLink,
  split,
  HttpLink,
  type FetchResult,
} from "@apollo/client";
import { getMainDefinition } from "@apollo/client/utilities";
import { loadErrorMessages, loadDevMessages } from "@apollo/client/dev";
import { CombinedGraphQLErrors } from "@apollo/client/errors";
import { useUserStore } from "../stores/userStore";
import { onError } from "@apollo/client/link/error";
import { setContext } from "@apollo/client/link/context";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { Observable } from "rxjs";

loadDevMessages();
loadErrorMessages();

const GRAPHQL_HTTP_URL = "http://localhost:3000/graphql";
const GRAPHQL_WS_URL = "ws://localhost:3000/graphql";

/**
 * Refresh token flow:
 * - Use `fetch` (not Apollo client) to avoid circular dependency:
 *   Apollo -> errorLink -> refreshToken -> Apollo -> ...
 * - Send cookies for httpOnly refresh token: `credentials: "include"`
 */
async function refreshToken(): Promise<string> {
  const res = await fetch(GRAPHQL_HTTP_URL, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: `mutation RefreshToken { refreshToken }` }),
  });

  if (!res.ok) throw new Error("Error getting new access token");

  const json: any = await res.json();
  const newAccessToken = json?.data?.refreshToken as string | undefined;
  if (!newAccessToken) throw new Error("New access token not received");

  localStorage.setItem("accessToken", newAccessToken);
  return `Bearer ${newAccessToken}`;
}

let retryCount = 0;
const maxRetry = 3;

/**
 * Subscriptions over WebSocket:
 * - Uses `graphql-ws` (modern) instead of deprecated `subscriptions-transport-ws`.
 * - Auth is sent via `connectionParams`.
 */
const wsLink = new GraphQLWsLink(
  createClient({
    url: GRAPHQL_WS_URL,
    lazy: true,
    retryAttempts: 10,
    connectionParams: () => ({
      // Most servers expect lowercase "authorization"
      authorization: `Bearer ${localStorage.getItem("accessToken") ?? ""}`,
    }),
  })
);

const authLink = setContext((_, { headers }) => ({
  headers: {
    ...headers,
    // HTTP queries/mutations auth header
    authorization: `Bearer ${localStorage.getItem("accessToken") ?? ""}`,
  },
}));

const errorLink = onError(({ error, operation, forward }) => {
  if (!CombinedGraphQLErrors.is(error)) {
    return;
  }

  for (const e of error.errors ?? []) {
    // Access token expired -> refresh once -> retry
    if (e.extensions?.code === "UNAUTHENTICATED" && retryCount < maxRetry) {
      retryCount++;

      return new Observable<FetchResult>((observer) => {
        let sub: { unsubscribe: () => void } | undefined;
        let stopped = false;

        refreshToken()
          .then((token) => {
            if (stopped) return;

            retryCount = 0;
            operation.setContext(({ headers = {} }) => ({
              headers: { ...headers, authorization: token },
            }));

            sub = forward(operation).subscribe({
              next: (value: FetchResult) => observer.next(value),
              error: (err: unknown) => observer.error(err),
              complete: () => observer.complete(),
            });
          })
          .catch((err: unknown) => {
            if (stopped) return;

            useUserStore.getState().clearUser();
            localStorage.removeItem("accessToken");
            observer.error(err);
          });

        return () => {
          stopped = true;
          sub?.unsubscribe();
        };
      });
    }

    // Refresh token invalid/missing => log out locally
    if (e.message === "Refresh token not found" || e.message === "Refresh token expired") {
      useUserStore.getState().clearUser();
      localStorage.removeItem("accessToken");
      return;
    }
  }

  // Do not forward by default (prevents duplicate requests)
  return;
});

/**
 * Base64 upload note:
 * - You send files as Base64 in a normal GraphQL input => no multipart needed.
 * - Therefore: normal HttpLink is enough (no apollo-upload-client).
 */
const httpLink = new HttpLink({
  uri: GRAPHQL_HTTP_URL,
  credentials: "include",
});

const httpChain = ApolloLink.from([errorLink, authLink, httpLink]);

const link = split(
  ({ query }) => {
    const def = getMainDefinition(query);
    return def.kind === "OperationDefinition" && def.operation === "subscription";
  },
  wsLink,
  httpChain
);

export const client = new ApolloClient({
  link,
  cache: new InMemoryCache({}),
});