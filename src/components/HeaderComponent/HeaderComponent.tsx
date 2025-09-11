import logo from "../../assets/logo.png"

export default function HeaderComponent() {
  return (
    <header className="py-4 px-8 bg-white flex items-center gap-2">

      <img src={logo} alt="SmartInbox Logo" className="w-8 h-8" />

      <h1 className="text-xl font-bold text-blue-600">SmartInbox</h1>
    </header>
  );
}
