import { useNavigate } from "react-router-dom";
function Navbar() {

    const navigate = useNavigate();

  const handleLogin = () => {
  navigate("/");
};
  return (

    <div className="bg-slate-800 p-4 rounded-2xl mb-8 flex justify-between items-center">

      <h1 className="text-2xl font-bold">
        SmartLight IoT
      </h1>

      <button className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg" onClick={handleLogin}>
        Salir
      </button>

    </div>
  );
}

export default Navbar;