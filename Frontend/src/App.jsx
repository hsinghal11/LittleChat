import {BrowserRouter, Route, Routes} from "react-router-dom";
import { Landing } from "./components/landing";
import { Auth } from "./components/Auth";
import { Chat } from "./components/Chat";


function App() {

  return (
    <>
    
      <BrowserRouter>
        <Routes>
           <Route path="/" element={<Landing />} />
           <Route path="/auth" element={<Auth />} />
           <Route path="/chat" element={<Chat />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App
