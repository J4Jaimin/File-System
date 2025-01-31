import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import DirectoryView from "./DirectoryView";
import RegisterUser from "./RegisterUser";

const router = createBrowserRouter([
    {
        path: "/register",
        element: <RegisterUser />,
    },
    {
        path: "/directory",
        element: <DirectoryView />,
    },
    {
        path: "/*",
        element: <Navigate to="/register" replace />,
    }
]);

function App() {
    return <RouterProvider router={router} />;
}

export default App;
