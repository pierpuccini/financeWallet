/* React */
import React from "react";
/* Firebase */
import { useFirebase } from "react-redux-firebase";
import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";

const Login = () => {
  const firebase = useFirebase();

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
      }}
      firebaseAuth={firebase.auth()}
    />
  );
};

export default Login;
