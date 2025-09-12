// LoginPage.tsx
import toast from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";
import AuthFormComponent from "../../components/AuthFormComponent/AuthFormComponent";
import GoogleAuthButtonComponent from "../../components/GoogleAuthButtonComponent/GoogleAuthButtonComponent";
import HeaderComponent from "../../components/HeaderComponent/HeaderComponent";
import authService from "../../services/authService";
import { Link, useNavigate } from "react-router-dom";

export default function LoginPage() {
  const { setUserAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (values: { email: string; password: string }) => {
    try {
      const res = await authService.login(values);
      toast.success("Logged in successfully!");
      setUserAuthenticated(true);
      navigate("/connect-google", { state: { name: res.data.name, email: res.data.email } });
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="px-2 py-4">
        <HeaderComponent />
      </div>
      <div className="flex items-center justify-center px-4 py-8 sm:py-10">
        <div className="w-full max-w-xs sm:max-w-sm bg-white rounded-2xl shadow-lg p-4 sm:p-5 space-y-5">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-2 p-1">
            Welcome Back
          </h1>

          <AuthFormComponent mode="login" onSubmit={handleLogin} />

          <div className="flex items-center gap-2 mt-4">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-gray-400 text-sm">or</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          <GoogleAuthButtonComponent />
        </div>
      </div>

      <div className="text-center text-sm text-gray-500 mt-2">
        Don’t have an account?{" "}
        <Link to="/signup" className="text-blue-600 hover:underline">
            Sign up
        </Link>
      </div>

    </div>
  );
}
