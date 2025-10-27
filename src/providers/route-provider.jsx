import { RouterProvider as AriaRouterProvider } from "react-aria-components";
import { useNavigate, useHref } from "react-router-dom";

export const RouteProvider = ({ children }) => {
    const navigate = useNavigate();
    const useHrefImpl = useHref;

    return (
        <AriaRouterProvider navigate={navigate} useHref={useHrefImpl}>
            {children}
        </AriaRouterProvider>
    );
};

