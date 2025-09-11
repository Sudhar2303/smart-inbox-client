import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import authService from "../../services/authService";
import toast from "react-hot-toast";

const AuthCheckPage = () => {
    const { setUserAuthenticated } = useAuth();
    const navigate = useNavigate();

  useEffect(() => {
    const verifyUser = async () => {
        try {
            await authService.checkAuthStatus()
            toast.success("Logged in successfully!");
            setUserAuthenticated(true);
            navigate("/inbox")
        }
        catch(error: any)
        {
            console.log(error)
            toast.error(error?.response?.data?.message || "Signup failed");
            navigate("/login")
        }
    }
    verifyUser()
  }, [navigate]);

  return (
    <div className="flex justify-center items-center h-screen">
      <p className="text-lg font-medium">Checking authentication...</p>
    </div>
  );
};

export default AuthCheckPage;
