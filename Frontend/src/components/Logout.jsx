import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Logout() {
  useEffect(() => {
    localStorage.clear("token");
    localStorage.clear("senderId");
    const navigate = useNavigate();
    navigate("/");
  }, []);
}

export default Logout;
