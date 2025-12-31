import React, { Children } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ApolloProvider } from "@apollo/client/react";
import { client } from "./apolloClient";
import { MantineProvider } from "@mantine/core";

import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/Home";

// If you use Mantine global styles in your project, keep this import too:
// import "@mantine/core/styles.css";


const router = createBrowserRouter([
  { path:"/", children: <Home />  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <MantineProvider>
        <App />
      </MantineProvider>
    </ApolloProvider>
  </React.StrictMode>
);