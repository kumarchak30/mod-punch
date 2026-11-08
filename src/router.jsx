import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Signup from "./components/Signup";
import Signin from "./components/Signin";
import Dashboard from "./components/Dashboard";
import Onboarding from "./components/Onboarding";
import Profile from "./components/Profile";
import PrivateRoute from "./components/privateRoute.jsx";

export const router = createBrowserRouter([
    { path: "/", element: <App /> },
    { path: "/signup", element: <Signup /> },
    { path: "/signin", element: <Signin /> },
    { path: "/dashboard", element: <PrivateRoute> <Dashboard /> </PrivateRoute> },
    { path: "/onboarding", element: <Onboarding /> },
    { path: "/profile", element: <PrivateRoute> <Profile /> </PrivateRoute> },

    // dev-only: view the profile page without signing in (shows as "Player", data saved under "guest").
    // Not included in production builds.
    ...(import.meta.env.DEV ? [{ path: "/dev/profile", element: <Profile /> }] : []),
]);