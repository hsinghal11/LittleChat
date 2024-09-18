import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const [authStatus, setAuthStatus] = useState("Token found");

  const navigate = useNavigate();

  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setAuthStatus("No token found");
        navigate("/Signup");
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:4000/api/protection/checktoken",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "auth-token": token,
            },
          }
        );
        console.log(response);
        
        if (!response.ok) {
          throw new Error("Token check failed");
        }
        // You might want to update auth status based on the response
      } catch (err) {
        console.log(err);
      }
    };

    checkToken();
  }, [navigate]); // Add navigate to the dependency array to avoid stale closure issues

  return (
    <div>
      <h1>Home</h1>
      <p>Status: {authStatus}</p>
    </div>
  );
}

export default Home;
