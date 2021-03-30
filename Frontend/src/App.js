/* React */
import React, { useState, useMemo, cloneElement } from "react";
import PropTypes from "prop-types";
/* React Router */
import { useHistory } from "react-router-dom";
/* Routes */
import Routes from "./containers/Routes";
/* Redux */
import { useSelector } from "react-redux";
/* React Redux Firebase */
import { isLoaded, isEmpty } from "react-redux-firebase";
/* Material Imports */
import useScrollTrigger from "@material-ui/core/useScrollTrigger";
import SwipeableDrawer from "@material-ui/core/SwipeableDrawer";
import Container from "@material-ui/core/Container";
/* Assets */
/* Containers */
/* Components */
import AuthIsLoaded from "./components/UI/authIsLoaded/AuthIsLoaded";
import TopBar from "./components/UI/topBar/TopBar";
import SideList from "./components/UI/sideList/SideList";
import BottomNav from "./components/UI/bottomNav/BottomNav";
/* Themes */
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
/* General */
import "./App.css";

const App = (props) => {
  const iOS = process.browser && /iPad|iPhone|iPod/.test(navigator.userAgent);
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const auth = useSelector((state) => state.firebase.auth);
  const history = useHistory();

  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = (open) => {
    setDrawerOpen(open);
  };

  const theme = useMemo(
    () =>
      createMuiTheme({
        palette: {
          mode: prefersDarkMode ? "dark" : "light",
        },
        typography: {
          fontFamily: "Quicksand, Roboto",
          h1: { fontWeight: 600 },
          h2: { fontWeight: 600 },
          h3: { fontWeight: 600 },
          h4: { fontWeight: 600 },
          h5: { fontWeight: 600 },
          h6: { fontWeight: 600 },
          body1: { fontWeight: 600 },
        },
      }),
    [prefersDarkMode]
  );

  const handleNavChange = (event, newValue) => {
    history.push(`/${newValue}`);
  };

  const authedBasicUI = (
    <React.Fragment>
      <ElevationScroll {...props}>
        <TopBar toggleDrawer={toggleDrawer} drawerState={drawerOpen} />
      </ElevationScroll>
      <SwipeableDrawer
        disableBackdropTransition={!iOS}
        disableDiscovery={iOS}
        open={drawerOpen}
        onClose={() => {
          toggleDrawer(false);
        }}
        onOpen={() => {
          toggleDrawer(true);
        }}
      >
        <SideList toggleDrawer={toggleDrawer} onChange={handleNavChange} />
      </SwipeableDrawer>
      <BottomNav onChange={handleNavChange} />
    </React.Fragment>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {isLoaded(auth) && !isEmpty(auth) ? authedBasicUI : null}
      <Container className="App-container">
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
