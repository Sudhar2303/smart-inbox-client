import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage/LoginPage";
import SignupPage from "./pages/SignupPage/SignupPage";
import InboxPage from "./pages/InboxPage/InboxPage";
import AuthCheckPage from "./pages/AuthCheckPage/AuthCheckPage";
import ConnectGooglePage from "./pages/ConnectGooglePage/ConnectGooglePage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/connect-google" element={<ConnectGooglePage />} />
        <Route path="/inbox" element={<InboxPage />} />
        <Route path="/authcheck" element={<AuthCheckPage />} />
      </Routes>
    </Router>
  );
}

export default App;
