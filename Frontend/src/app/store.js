import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "./slices/counter/counterSlice";

const reducer = {
  counter: counterReducer,
};

const preloadedState = {};

export default configureStore({
  reducer,
  devTools: process.env.NODE_ENV !== "production",
  preloadedState,
});
