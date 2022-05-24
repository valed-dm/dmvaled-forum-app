import React from "react";
import ReactModal from "react-modal";
import { Provider } from "react-redux";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import App from "./App";
import store from "./store/configureStore";
import ErrorBoundary from "./components/ErrorBoundary";
import reportWebVitals from "./reportWebVitals";
import "./index.css";


const client = new ApolloClient({
  uri: `http://localhost:8080/graphql`,
  credentials: "include",
  cache: new InMemoryCache({
    resultCaching: false,
  }),
});

const container = document.getElementById("root");
if (!container) throw new Error("Failed to find the root element");
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <ApolloProvider client={client}>
          <ErrorBoundary>{[<App key={"App"} />]}</ErrorBoundary>
        </ApolloProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);

ReactModal.setAppElement("#root");
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
