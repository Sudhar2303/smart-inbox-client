import { useLocation } from "react-router-dom";
import HeaderComponent from "../../components/HeaderComponent/HeaderComponent";
import GoogleAuthButtonComponent from "../../components/GoogleAuthButtonComponent/GoogleAuthButtonComponent";

export default function ConnectGooglePage() {
  const location = useLocation();

  const { name, email } = location.state || { name: "", email: "" };

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderComponent />
      <div className="flex items-center justify-center px-4 mt-8">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 space-y-6 text-center">
          <h1 className="text-2xl font-bold text-gray-800">Hello {name || "User"} 👋</h1>
          <p className="text-gray-600">
            You are logged in with <span className="font-semibold">{email}</span>.
          </p>
          <p className="text-gray-600 mt-2">
            To access your Gmail inbox, please authenticate with Google below.
          </p>

          <div className="mt-6">
            <GoogleAuthButtonComponent />
          </div>
        </div>
      </div>
    </div>
  );
}
