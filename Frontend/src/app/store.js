/* Redux */
import { configureStore } from "@reduxjs/toolkit";
/* Firebase */
import { firebaseReducer } from "react-redux-firebase";
import { firestoreReducer } from "redux-firestore"; // <- needed if using firestore

/* Custom reducers */
import counterReducer from "./slices/counter/counterSlice";

const reducer = {
  firebase: firebaseReducer,
  firestore: firestoreReducer,
  counter: counterReducer,
};

const preloadedState = {};

export default configureStore({
  reducer,
  devTools: process.env.NODE_ENV !== "production",
  preloadedState,
});
