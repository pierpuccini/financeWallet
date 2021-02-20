/* React */
import React, { useMemo } from "react";
/* React Router */
import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom";
/* Redux */
import { useSelector } from "react-redux";
/* Firebase */
import { isLoaded, isEmpty } from "react-redux-firebase";
/* Assets */
/* Containers */
/* Components */
import LoginPage from "./components/UI/loginPage/LoginPage";
import Loader from "./components/UI/loader/PngLoader";
/* Themes */
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
/* General */
import "./App.css";

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

const App = () => {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  const theme = useMemo(
    () =>
      createMuiTheme({
        palette: {
          type: prefersDarkMode ? "dark" : "light",
        },
      }),
    [prefersDarkMode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Switch>
          <Route path="/login">
            <AuthIsLoaded>
              {/* Component containing a login which redirects
              to /protected. NOTE: Not included in example */}
              <LoginPage />
              <div>login Auth is Loaded</div> {/* Rest of App Components */}
            </AuthIsLoaded>
          </Route>
          <PrivateRoute path="/dashboard">
            <AuthIsLoaded>
              <div>Protected content Auth is Loaded</div>{" "}
              {/* Rest of App Components */}
            </AuthIsLoaded>
          </PrivateRoute>
        </Switch>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
