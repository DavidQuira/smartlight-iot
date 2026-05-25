import { useNavigate } from "react-router-dom";

function Navbar() {

  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/");
  };

  const goToDashboard = () => {
    navigate("/dashboard");
  };

  const goToGrafana = () => {
    navigate("/grafana");
  };

  return (

    <div className="

      bg-white/10
      backdrop-blur-xl

      border border-white/10

      p-5 rounded-3xl
      mb-10

      flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between

      shadow-[0_0_30px_rgba(15,23,42,0.6)]

    ">

      {/* Logo + info */}
      <div className="flex items-center gap-4">

        <div className="

          w-14 h-14
          rounded-2xl

          bg-linear-to-br
          from-blue-500
          to-cyan-400

          flex items-center justify-center

          text-2xl font-extrabold

          shadow-[0_0_20px_rgba(59,130,246,0.5)]

        ">
          S
        </div>

        <div>

          <h1 className="text-2xl font-extrabold tracking-wide">
            SmartLight IoT
          </h1>

          <p className="text-slate-400 text-sm">
            Sistema Inteligente de Iluminación
          </p>

        </div>

      </div>

      {/* Navegación + estado */}
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">

        <div className="flex flex-wrap gap-3 justify-start sm:justify-end">

          <button
            onClick={goToDashboard}
            className="

              px-4 py-3
              rounded-2xl

              bg-white/5
              hover:bg-white/10

              border border-white/10

              font-semibold

              transition-all duration-300
              hover:scale-105

              cursor-pointer

            "
          >
            Dashboard
          </button>

          <button
            onClick={goToGrafana}
            className="

              px-4 py-3
              rounded-2xl

              bg-cyan-500/15
              hover:bg-cyan-500/25

              border border-cyan-400/30

              font-semibold text-cyan-300

              transition-all duration-300
              hover:scale-105

              cursor-pointer

            "
          >
            Grafana
          </button>

        </div>

        <div className="flex items-center gap-3 sm:justify-end">

        <div className="

          flex items-center gap-2

          bg-green-500/10
          border border-green-400/30

          px-4 py-2 rounded-2xl

        ">

          <div className="

            w-3 h-3
            rounded-full
            bg-green-400
            animate-pulse

          "></div>

          <p className="text-green-400 font-semibold">
            Online
          </p>

        </div>

        <button
          onClick={handleLogout}
          className="

            px-5 py-3
            rounded-2xl

            bg-red-600
            hover:bg-red-700

            font-bold

            transition-all duration-300
            hover:scale-105

            cursor-pointer

            shadow-[0_0_20px_rgba(220,38,38,0.5)]

          "
        >
          Salir
        </button>

        </div>

      </div>

    </div>
  );
}

export default Navbar;