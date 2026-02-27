import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Landing from "./pages/Landing.jsx";
import Result from "./pages/Result.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/scan" element={<Landing />} />
      <Route path="/result" element={<Result />} />
      <Route path="/verify" element={<div>T&P Verification Coming Soon</div>} />
    </Routes>
  );
}

export default App;