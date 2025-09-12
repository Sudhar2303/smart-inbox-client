import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './contexts/AuthContext.tsx'
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <Toaster
      position="bottom-right"
      toastOptions={{
        className: "",
        style: {
          background: "#1e293b", // slate-800
          color: "#f8fafc",      // slate-50
          borderRadius: "8px",
          padding: "12px 16px",
          fontSize: "14px",
        },
        success: {
          style: {
            background: "#16a34a", // green-600
            color: "#fff",
          },
        },
        error: {
          style: {
            background: "#dc2626", // red-600
            color: "#fff",
          },
        },
      }}
    />
    <App />
    </AuthProvider>
)
