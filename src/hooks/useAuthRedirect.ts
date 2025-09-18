import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "@constants/routeConstants";

const useAuthRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
    } else {
      navigate(ROUTE_PATHS.INIT);
    }
  }, [navigate]);
};

export default useAuthRedirect;
