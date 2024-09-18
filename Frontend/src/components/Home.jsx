import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Chat from "./Chat";

function Home() {
  const [authStatus, setAuthStatus] = useState("Token found");
  const [isCheckingToken, setIsCheckingToken] = useState(true); // New state to control check status
  const navigate = useNavigate();
  const [showChat, setShowChat] = useState(false);
  const [otherId, setOtherId ]= useState("");

  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setAuthStatus("No token found");
        navigate("/Signup");
        return; // Exit function to avoid infinite loop
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
          setAuthStatus("Invalid token"); // Update status for invalid token
          navigate("/login");
          return; // Exit after navigation
        }

        setAuthStatus("Token valid");
      } catch (err) {
        console.log(err);
        setAuthStatus("Error occurred during token validation");
      } finally {
        setIsCheckingToken(false); // Token check is complete
      }
    };

    if (isCheckingToken) {
      checkToken(); // Only call if check hasn't been completed
    }
  }, []); // Ensure check only runs once


  function startChat(){
    localStorage.setItem("otherId", otherId)
    // setShowChat(true);
    navigate("/chat")
  }

  return (
    <div>
      <h1>Home</h1>
      <p>Status: {authStatus}</p>
      <input type="text" placeholder="Other person id" onChange={(e)=>{setOtherId(e.target.value)}} />
      <button onClick={startChat}>Start chat </button>
    </div>
  );
}

export default Home;
