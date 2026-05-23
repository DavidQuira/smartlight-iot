import { useNavigate } from "react-router-dom";

function Login() {

  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/dashboard");
  };

  return (

    <div className="

      min-h-screen
      flex items-center justify-center

      bg-gradient-to-br
      from-slate-950
      via-slate-900
      to-blue-950

      text-white
      overflow-hidden
      relative

    ">

      {/* Glow decorativo */}
      <div className="

        absolute
        w-[500px] h-[500px]

        bg-cyan-500/10
        rounded-full
        blur-3xl

        top-[-200px]
        left-[-150px]

      "></div>

      <div className="

        absolute
        w-[500px] h-[500px]

        bg-blue-500/10
        rounded-full
        blur-3xl

        bottom-[-200px]
        right-[-150px]

      "></div>

      {/* Card principal */}
      <div className="

        relative
        w-[430px]

        bg-slate-900/60
        backdrop-blur-xl

        border border-slate-700

        rounded-[32px]

        p-10

        shadow-[0_0_50px_rgba(59,130,246,0.15)]

      ">

        {/* Header */}
        <div className="text-center mb-10">

          <div className="

            w-24 h-24
            mx-auto mb-6

            rounded-3xl

            bg-gradient-to-br
            from-blue-500
            to-cyan-400

            flex items-center justify-center

            text-4xl font-extrabold

            shadow-[0_0_30px_rgba(59,130,246,0.5)]

          ">
            S
          </div>

          <h1 className="

            text-5xl
            font-extrabold
            tracking-wide

          ">
            SmartLight
          </h1>

          <p className="

            text-slate-400
            mt-3
            text-lg

          ">
            Dashboard Inteligente IoT
          </p>

        </div>

        {/* Inputs */}
        <div className="space-y-5">

          <div>

            <label className="text-slate-400 text-sm mb-2 block">
              Usuario
            </label>

            <input
              type="text"
              placeholder="Ingresa tu usuario"
              className="

                w-full
                p-4

                rounded-2xl

                bg-slate-800/80

                border border-slate-700

                outline-none

                focus:border-cyan-400
                focus:ring-2
                focus:ring-cyan-500/30

                transition-all duration-300

              "
            />

          </div>

          <div>

            <label className="text-slate-400 text-sm mb-2 block">
              Contraseña
            </label>

            <input
              type="password"
              placeholder="Ingresa tu contraseña"
              className="

                w-full
                p-4

                rounded-2xl

                bg-slate-800/80

                border border-slate-700

                outline-none

                focus:border-cyan-400
                focus:ring-2
                focus:ring-cyan-500/30

                transition-all duration-300

              "
            />

          </div>

          <button
            onClick={handleLogin}
            className="

              w-full
              py-4
              mt-4

              rounded-2xl

              font-bold
              text-lg

              bg-gradient-to-r
              from-blue-500
              to-cyan-400

              hover:scale-[1.02]

              transition-all duration-300

              shadow-[0_0_25px_rgba(34,211,238,0.4)]

            "
            cursor-pointer
          >
            Entrar al Sistema
          </button>

        </div>

        {/* Footer */}
        <div className="mt-8 text-center">

          <p className="text-slate-500 text-sm">
            SmartLight IoT • Control Inteligente de Iluminación
          </p>

        </div>

      </div>

    </div>
  );
}

export default Login;