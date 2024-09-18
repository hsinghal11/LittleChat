import {BrowserRouter, Route, Routes} from "react-router-dom";
import {Landing}  from "./components/Landing";
import Chat from "./components/Chat";
import SignUp from "./components/Signup";
import LogIn from "./components/Login";
import Home from "./components/Home";


function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
           <Route path="/home" element={<Home />} />
           <Route path="/" element={<Landing />} />
           <Route path="/signup" element={<SignUp />} />
           <Route path="/login" element={<LogIn />} />
           <Route path="/chat" element={<Chat />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App
