import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Signup from "./components/Signup";
import Signin from "./components/Signin";
import Onboarding from "./components/Onboarding";
import PrivateRoute from "./components/privateRoute.jsx";
import HomePage from "./pages/HomePage";

export const router = createBrowserRouter([
    { path: "/", element: <App /> },
    { path: "/signup", element: <Signup /> },
    { path: "/signin", element: <Signin /> },
    { path: "/dashboard", element: <PrivateRoute><HomePage /></PrivateRoute> },
    { path: "/onboarding", element: <Onboarding /> },
]);