/* React */
import React from "react";
/* React Router */
import { Route, Redirect } from "react-router-dom";
/* Redux */
import { useSelector } from "react-redux";
/* Firebase */
import { isLoaded, isEmpty } from "react-redux-firebase";

// A wrapper for <Route> that redirects to the login
// screen if you're not yet authenticated or if auth is not
// yet loaded
const PrivateRoute = ({ children, ...rest }) => {
  const auth = useSelector((state) => state.firebase.auth);
  return (
    <Route
      {...rest}
      render={({ location }) =>
        isLoaded(auth) && !isEmpty(auth) ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: "/login",
              state: { from: location },
            }}
          />
        )
      }
    />
  );
};

export default PrivateRoute;
