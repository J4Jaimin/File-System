import { createBrowserRouter, RouterProvider } from "react-router-dom";
import DirectoryView from "./DirectoryView";

const router = createBrowserRouter([
    {
        path: "/*",
        element: <DirectoryView />,
    },
    {
        path: "/directory/:dirId",
        element: <DirectoryView />,
    }
]);

function App() {
    return <RouterProvider router={router} />;
}

export default App;