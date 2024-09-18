import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function SignUp() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [alertMessage, setAlertMessage] = useState(null);
  const [viewPass, setViewPass] = useState(false);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const toLogin = () => {
    navigate("/login");
  };
   const handleClick = () => {
     navigate("/home");
   };
useEffect(()=>{
 

  if (token) {
    navigate("/home");
  }
},[])
  
  async function onSubmitSignUp() {
    const response = await fetch("http://localhost:4000/api/auth/createUser", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name,
        email: email,
        password: password,
      }),
    });

    const responseJson = await response.json();
    console.log(responseJson);

    if (responseJson.msg === "User created successfully") {
      setAlertMessage({ type: "success", text: responseJson.msg });
      localStorage.setItem("token", responseJson.token);
      localStorage.setItem("senderId", responseJson.user.id);
      handleClick();
    } else {
      setAlertMessage({
        type: "error",
        text: responseJson.msg || "Something went wrong!",
      });
    }
  }

  return (
    <>
      <div className="h-screen bg-slate-500 flex justify-center items-center">
        <div className="card bg-white p-8">
          <div className="card-body items-center">
            <div className="card-title text-purple-600 text-4xl mb-4">
              Little Chat
            </div>

            {/* Alert Message */}
            {alertMessage && (
              <div
                role="alert"
                className={`alert ${
                  alertMessage.type === "success"
                    ? "alert-success"
                    : "alert-error"
                }`}
              >
                {alertMessage.type === "success" ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 shrink-0 stroke-current"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 shrink-0 stroke-current"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                )}
                <span>{alertMessage.text}</span>
              </div>
            )}

            {/* Form Fields */}
            <div className="w-80 space-y-4">
              {" "}
              {/* This ensures equal alignment */}
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="Name"
                onChange={(e) => setName(e.target.value)}
              />
              <input
                type="email"
                className="input input-bordered w-full"
                placeholder="Email"
                onChange={(e) => setEmail(e.target.value)}
              />
              <label className="input input-bordered w-full flex items-center">
                <input
                  type={viewPass ? "text" : "password"}
                  className="w-full"
                  placeholder="Password"
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button className="ml-2" onClick={() => setViewPass(!viewPass)}>
                  {viewPass == true ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                      />
                    </svg>
                  )}
                </button>{" "}
                {/* Eye icon button */}
              </label>
            </div>

            {/* Navigate to login */}
            <p
              className="mt-4 underline text-blue-600 hover:cursor-pointer visited:text-gray-600"
              onClick={toLogin}
            >
              Already have an account? Login
            </p>

            {/* Submit Button */}
            <button
              className="btn btn-primary bg-purple-700 mt-4"
              onClick={onSubmitSignUp}
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default SignUp;
