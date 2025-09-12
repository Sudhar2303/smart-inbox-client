import { useLocation } from "react-router-dom";
import HeaderComponent from "../../components/HeaderComponent/HeaderComponent";
import GoogleAuthButtonComponent from "../../components/GoogleAuthButtonComponent/GoogleAuthButtonComponent";

export default function ConnectGooglePage() {
  const location = useLocation();
  const { name, email } = location.state || { name: "", email: "" };

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderComponent />

      <div className="flex items-start justify-center px-4 pt-8 sm:pt-20">
        <div className="w-full max-w-xs sm:max-w-sm md:max-w-md bg-white rounded-2xl shadow-lg p-5 sm:p-6 space-y-4 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Hello {name || "User"} 👋
          </h1>

          <p className="text-gray-600 text-sm sm:text-base">
            You are logged in with <span className="font-semibold">{email}</span>.
          </p>
          <p className="text-gray-600 text-sm sm:text-base">
            To access your Gmail inbox, please authenticate with Google below.
          </p>

          <div className="mt-4 sm:mt-6">
            <GoogleAuthButtonComponent />
          </div>
        </div>
      </div>
    </div>
  );
}
