/* Redux */
import { configureStore } from "@reduxjs/toolkit";
/* Firebase */
import { firebaseReducer } from "react-redux-firebase";
/* Custom reducers */
import counterReducer from "./slices/counter/counterSlice";

const reducer = {
  firebase: firebaseReducer,
  counter: counterReducer,
};

const preloadedState = {};

export default configureStore({
  reducer,
  devTools: process.env.NODE_ENV !== "production",
  preloadedState,
});
