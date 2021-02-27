/* React */
import React from "react";
/* Redux */
import { useSelector } from "react-redux";
/* Firebase */
import { isLoaded } from "react-redux-firebase";
/* Components */
import Loader from "../loader/PngLoader";

const AuthIsLoaded = ({ children }) => {
  const auth = useSelector((state) => state.firebase.auth);
  if (!isLoaded(auth))
    return (
      <div className="App">
        <Loader />
      </div>
    );
  return children;
};

export default AuthIsLoaded;
