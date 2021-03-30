/* React */
import React from "react";
/* React Router */
import { useHistory } from "react-router-dom";
/* Firebase */
import { useFirebase } from "react-redux-firebase";
import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";

const Login = () => {
  const firebase = useFirebase();
  const history = useHistory();

  return (
    <StyledFirebaseAuth
      uiConfig={{
        signInFlow: "popup",
        signInSuccessUrl: "/dashboard",
        signInOptions: [
          firebase.auth.GoogleAuthProvider.PROVIDER_ID,
          {
            provider: firebase.auth.PhoneAuthProvider.PROVIDER_ID,
            recaptchaParameters: {
              type: "image", // 'audio'
              size: "invisible", // 'invisible' or 'compact'
              badge: "inline", //' bottomright' or 'inline' applies to invisible.
            },
            defaultCountry: "CO",
          },
        ],
        callbacks: {
          signInSuccessWithAuthResult: (authResult, redirectUrl) => {
            firebase.handleRedirectResult(authResult).then(() => {
              history.push();
            });
            return false;
          },
        },
      }}
      firebaseAuth={firebase.auth()}
    />
  );
};

export default Login;
