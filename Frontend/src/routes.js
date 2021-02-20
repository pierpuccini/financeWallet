/* React imports */
import React from "react";
import { Route, Switch, Redirect } from "react-router-dom";
/* Material imports */
import useMediaQuery from "@material-ui/core/useMediaQuery";
/* Component imports */
import asyncComponent from "./hoc/asyncComponent/asyncComponent";

const asyncAuth = asyncComponent(() => {
  return import("./containers/Auth/Auth");
});
const asyncDashboard = asyncComponent(() => {
  return import("./containers/Dashboard/Dashboard");
});

const Routes = (props) => {
  const isMobile = useMediaQuery("(max-width: 600px)");
  const { authenticated, navRoute, pathname, role, name, setTitle } = props;

  let routes, redirect;
  //first value in array indicates if route need auth, second and so forth indicates which user type has access
  const routesArray = [
    { url: "home", comp: asyncDashboard, availableTo: ["protected", "all"] },
    { url: "login", comp: asyncAuth, availableTo: ["un-protected", "all"] },
    { url: "sign-up", comp: asyncAuth, availableTo: ["un-protected", "all"] },
    {
      url: "forgot-login",
      comp: asyncAuth,
      availableTo: ["un-protected", "all"],
    },
  ];

  let urlPath = pathname;
  if (!authenticated) {
    urlPath !== "/login" &&
    urlPath !== "/sign-up" &&
    urlPath !== "/forgot-login"
      ? (redirect = <Redirect to="/login" />)
      : (redirect = null);
  } else {
    //Title Checker
    let title;
    switch (navRoute) {
      case "home":
        title = isMobile ? name : `Welcome Back, ${name}`;
        break;
      case "onboarding":
        title = `Welcome ${name}`;
        break;
      case "my-account":
        title = `${name}'s Account`;
        break;
      case "classrooms":
        title = `Classroom Manager`;
        break;
      case "classrooms/create":
        title = `Creating Classroom`;
        break;
      case "user-manager":
        title = `Manage Users`;
        break;
      default:
        title = "Edu Coins";
        break;
    }
    title = navRoute.includes("classrooms/edit") ? "Editing Classroom" : title;
    title = navRoute.includes("classrooms/view") ? "Viewing Classroom" : title;
    setTitle(title);
  }

  /* Conditional routes section */
  redirect = <Redirect to={`/${navRoute}`} />;

  //Available routes or Guarded routes
  routes = (
    <Switch>
      {routesArray.map((route, index) => {
        if (route.availableTo.includes("protected") && authenticated) {
          if (route.availableTo.includes("all")) {
            return (
              <Route
                path={`/${route.url}`}
                key={`/${route.url}`}
                component={route.comp}
              />
            );
          } else if (route.availableTo.includes(role)) {
            return (
              <Route
                path={`/${route.url}`}
                key={`/${route.url}`}
                component={route.comp}
              />
            );
          } else {
            return null;
          }
        } else if (route.availableTo.includes("un-protected")) {
          return (
            <Route
              path={`/${route.url}`}
              key={`/${route.url}`}
              component={route.comp}
            />
          );
        } else {
          return null;
        }
      })}
      <Redirect to={authenticated ? "/home" : "/login"} />
    </Switch>
  );

  return (
    <React.Fragment>
      {redirect}
      {routes}
    </React.Fragment>
  );
};

export default Routes;
