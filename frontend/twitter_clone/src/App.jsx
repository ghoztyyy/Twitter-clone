import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/home/Home";
import SignUpPage from "./pages/auth/signup/SignUp";
import LoginPage from "./pages/auth/login/LoginPage";
import Sidebar from "./components/common/Sidebar";
import RightPanel from "./components/common/RightPanel";
function App() {
    return (
        <div className="flex max-w-6xl mx-auto">
            <Sidebar />
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/login" element={<LoginPage />} />
            </Routes>
            <RightPanel />
        </div>
    );
}

export default App;
