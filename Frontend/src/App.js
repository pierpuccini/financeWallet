/* React */
import React, { useMemo } from "react";
/* React Router */
import { Switch, Route, Redirect } from "react-router-dom";
/* Redux */
import { useSelector } from "react-redux";
/* Firebase */
import { isLoaded } from "react-redux-firebase";
/* Assets */
/* Containers */
import LoginPage from "./containers/loginPage/LoginPage";
/* Components */
import Loader from "./components/UI/loader/PngLoader";
import PrivateRoute from "./components/UI/privateRoute/PrivateRoute";
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
      <AuthIsLoaded>
        <Switch>
          <Route path="/login">
            <LoginPage />
          </Route>
          <PrivateRoute path="/dashboard">
            <div>Protected content Auth is Loaded</div>
            {/* Rest of App Components */}
          </PrivateRoute>
          <Redirect to="/dashboard" />
        </Switch>
      </AuthIsLoaded>
    </ThemeProvider>
  );
};

export default App;
