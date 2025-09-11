import authService from "../../services/authService";
import googleImage from '../../assets/google.svg'

export default function GoogleAuthButtonComponent() {
  return (
    <button
      type="button"
      onClick={() => authService.googleLoginRedirect()}
      className="w-full flex items-center justify-center gap-3 border border-gray-300 bg-white py-2 px-4 rounded-lg shadow-sm hover:shadow-md hover:bg-gray-50 transition duration-200 ease-in-out transform hover:scale-105"
    >
      <img src = {googleImage} alt ="Google" className="w-5 h-5" />
      <span className="text-sm font-medium text-gray-700">Continue with Google</span>
    </button>
  );
}
