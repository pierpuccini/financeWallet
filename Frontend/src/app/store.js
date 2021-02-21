/* Redux */
import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
/* React Redux Firebase */
import { firebaseReducer } from "react-redux-firebase";
import { firestoreReducer } from "redux-firestore";
import { actionTypes } from "react-redux-firebase";

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
  middleware: getDefaultMiddleware({
    /* Disabling Serializable check for login regarding issue mentioned in:
    https://github.com/prescottprue/react-redux-firebase/issues/761#issuecomment-530036230.
    The link points directly to the fix
     */
    serializableCheck: {
      ignoredActions: [actionTypes.LOGIN],
    },
  }),
});
