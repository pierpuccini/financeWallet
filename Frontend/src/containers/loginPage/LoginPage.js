/* React */
import React from "react";
/* React router */
import { Redirect } from "react-router-dom"; // if you use react-router
/* Redux */
import { useSelector } from "react-redux";
/* Firebase */
import { isLoaded, isEmpty } from "react-redux-firebase";
/* Components */
import Loader from "../../components/UI/loader/PngLoader";
import Login from "../../components/UI/login/Login";

const LoginPage = () => {
  const auth = useSelector((state) => state.firebase.auth);

  let element = (
    <div className="App">
      <Loader />
    </div>
  );

  if (isLoaded(auth) && isEmpty(auth)) {
    element = <Login />;
  } else if (isLoaded(auth) && !isEmpty(auth)) {
    element = <Redirect to="/dashboard" />;
  }

  return element;
};

export default LoginPage;
