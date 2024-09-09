import {ButtonRouter, Route, Routes} from "react-router-dom";


function App() {

  return (
      <ButtonRouter>
        <Routes>
          <Route path="/" element={<Landing/>}/>
          <Route path="/auth" element={<Auth/>}/>
          <Route path="/chat" element={<Chat/>}/>
        </Routes>
      </ButtonRouter>
  )
}

export default App
