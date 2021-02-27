/* React */
import React, { useMemo, cloneElement } from "react";
import PropTypes from "prop-types";
/* Routes */
import Routes from "./containers/Routes";
/* Redux */
import { useSelector } from "react-redux";
/* Firebase */
import { isLoaded, isEmpty } from "react-redux-firebase";
/* Material Imports */
import useScrollTrigger from "@material-ui/core/useScrollTrigger";
import Container from "@material-ui/core/Container";
/* Assets */
/* Containers */
/* Components */
import AuthIsLoaded from "./components/UI/authIsLoaded/AuthIsLoaded";
import TopBar from "./components/UI/topBar/TopBar";
/* Themes */
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
/* General */
import "./App.css";

const App = (props) => {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const auth = useSelector((state) => state.firebase.auth);

  const theme = useMemo(
    () =>
      createMuiTheme({
        palette: {
          mode: prefersDarkMode ? "dark" : "light",
        },
      }),
    [prefersDarkMode]
  );

  const authedBasicUI = (
    <React.Fragment>
      <ElevationScroll {...props}>
        <TopBar />
      </ElevationScroll>
    </React.Fragment>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {isLoaded(auth) && !isEmpty(auth) ? authedBasicUI : null}
      <Container>
        <AuthIsLoaded>
          <Routes />
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
