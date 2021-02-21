/* React */
import React from "react";
/* React router */
import { Redirect } from "react-router-dom"; // if you use react-router
/* Redux */
import { useSelector } from "react-redux";
/* Firebase */
import { useFirebase, isLoaded, isEmpty } from "react-redux-firebase";
import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";
/* Components */
import Loader from "../../UI/loader/PngLoader";

const LoginPage = () => {
  const firebase = useFirebase();
  const auth = useSelector((state) => state.firebase.auth);

  let element = (
    <div className="App">
      <Loader />
    </div>
  );

  if (isLoaded(auth) && isEmpty(auth)) {
    element = (
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
        }}
        firebaseAuth={firebase.auth()}
      />
    );
  } else if (isLoaded(auth) && !isEmpty(auth)) {
    element = <Redirect to="/dashboard" />;
  }

  return element;
};

export default LoginPage;
