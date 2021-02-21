/* React Imports */
import React from "react";
import ReactDOM from "react-dom";
/* React router */
import { BrowserRouter } from "react-router-dom";
/* App Imports */
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import "./index.css";
import "fontsource-roboto";
/* Redux Imports */
import { Provider } from "react-redux";
import store from "./app/store";
/* Firebase Imports */
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import fbConfig from "./firebase.config";
/* React-redux-firebase */
import { ReactReduxFirebaseProvider } from "react-redux-firebase";
import { createFirestoreInstance } from "redux-firestore";

// react-redux-firebase config
const rrfConfig = {
  userProfile: "users",
  useFirestoreForProfile: true,
  // enableClaims: true // Get custom claims along with the profile
};

// Initialize firebase instance
firebase.initializeApp(fbConfig);
// Initialize other services on firebase instance
// firebase.firestore() // <- needed if using firestore

const rrfProps = {
  firebase,
  config: rrfConfig,
  dispatch: store.dispatch,
  createFirestoreInstance, // <- needed if using firestore
};

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <ReactReduxFirebaseProvider {...rrfProps}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ReactReduxFirebaseProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
