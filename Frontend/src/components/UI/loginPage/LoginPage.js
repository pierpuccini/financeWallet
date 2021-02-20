/* React */
import React from "react";
/* React router */
import { useHistory } from "react-router-dom"; // if you use react-router
/* Redux */
import { useSelector } from "react-redux";
/* Firebase */
import { useFirebase, isEmpty } from "react-redux-firebase";
import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";

const LoginPage = () => {
  const firebase = useFirebase();
  const auth = useSelector((state) => state.firebase.auth);

  let history = useHistory();

  return (
    <div>
      <StyledFirebaseAuth
        uiConfig={{
          signInFlow: "redirect",
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
                history.push(redirectUrl);
              });
              return false;
            },
          },
        }}
        firebaseAuth={firebase.auth()}
      />
      <div>
        <h2>Auth</h2>
        {isEmpty(auth) ? (
          <span>Not Authed</span>
        ) : (
          <pre>{JSON.stringify(auth, null, 2)}</pre>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
