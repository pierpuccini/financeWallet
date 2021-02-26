/* React */
import React, { useMemo, cloneElement } from "react";
import PropTypes from "prop-types";
/* React Router */
import { Switch, Route, Redirect } from "react-router-dom";
/* Redux */
import { useSelector } from "react-redux";
/* Firebase */
import { isLoaded } from "react-redux-firebase";
/* Material Imports */
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import useScrollTrigger from "@material-ui/core/useScrollTrigger";
import Container from "@material-ui/core/Container";
/* Assets */
/* Containers */
import LoginPage from "./containers/loginPage/LoginPage";
import Dashboard from "./containers/dashboard/Dashboard";
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

const App = (props) => {
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
      <ElevationScroll {...props}>
        <AppBar>
          <Toolbar>
            <Typography variant="h6">Scroll to Elevate App Bar</Typography>
          </Toolbar>
        </AppBar>
      </ElevationScroll>
      <Toolbar />
      <Container>
        <AuthIsLoaded>
          <Switch>
            <Route path="/login" component={LoginPage}></Route>
            <PrivateRoute
              path="/dashboard"
              component={Dashboard}
            ></PrivateRoute>
            <Redirect to="/dashboard" />
          </Switch>
        </AuthIsLoaded>
      </Container>
    </ThemeProvider>
  );
};

const ElevationScroll = (props) => {
  const { children, window } = props;
  // Note that you normally won't need to set the window ref as useScrollTrigger
  // will default to window.
  // This is only being set here because the demo is in an iframe.
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
    target: window ? window() : undefined,
  });

  return cloneElement(children, {
    elevation: trigger ? 4 : 0,
  });
};

ElevationScroll.propTypes = {
  children: PropTypes.element.isRequired,
};

export default App;
