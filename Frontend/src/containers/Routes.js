/* React */
import React, { lazy, Suspense } from "react";
/* React Router */
import { Switch, Route, Redirect } from "react-router-dom";
/* Components */
import Loader from "../components/UI/loader/PngLoader";
import PrivateRoute from "../components/UI/privateRoute/PrivateRoute";

/* Lazy imports */
const LoginPage = lazy(() => import("./loginPage/LoginPage"));
const Dashboard = lazy(() => import("./dashboard/Dashboard"));

const Routes = () => {
  const routesArray = [
    {
      route: "/login",
      comp: LoginPage,
      protected: false,
    },
    {
      route: "/dashboard",
      comp: Dashboard,
      protected: true,
    },
  ];

  return (
    <Suspense fallback={<Loader />}>
      <Switch>
        {routesArray.map((route) => {
          const RouteComp = route.comp;
          if (route.protected) {
            return (
              <PrivateRoute key={route.route} path={route.route}>
                <RouteComp />
              </PrivateRoute>
            );
          }
          return (
            <Route key={route.route} path={route.route}>
              <RouteComp />
            </Route>
          );
        })}
        <Redirect to="/dashboard" />
      </Switch>
    </Suspense>
  );
};

export default Routes;
