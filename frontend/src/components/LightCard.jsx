function LightCard({ title, mode, setMode }) {

  const isOn = mode === "on";
  const isAuto = mode === "auto";

  return (

    <div className={`

      p-6 rounded-3xl border
      backdrop-blur-lg
      transition-all duration-300
      hover:scale-105

      ${isAuto
        ? "bg-yellow-500/10 border-yellow-400 shadow-[0_0_25px_rgba(250,204,21,0.5)]"
        : isOn
        ? "bg-green-500/10 border-green-400 shadow-[0_0_25px_rgba(34,197,94,0.5)]"
        : "bg-slate-800/70 border-slate-700"
      }

    `}>

      <div className="flex items-center justify-between mb-6">

        <h2 className="text-2xl font-bold">
          {title}
        </h2>

        <div className={`

          w-5 h-5 rounded-full

          ${isAuto
            ? "bg-yellow-400 animate-pulse"
            : isOn
            ? "bg-green-400 animate-pulse"
            : "bg-red-500"
          }

        `}></div>

      </div>

      <p className={`

        text-5xl font-extrabold mb-8

        ${isAuto
          ? "text-yellow-400"
          : isOn
          ? "text-green-400"
          : "text-red-400"
        }

      `}>
        {isAuto ? "AUTO" : isOn ? "ON" : "OFF"}
      </p>

      <div className="grid grid-cols-3 gap-3">

        <button
          onClick={() => setMode("on")}
          className={`

            py-3 rounded-2xl
            font-bold
            transition-all duration-300
            cursor-pointer

            ${isOn
              ? "bg-green-500"
              : "bg-slate-700 hover:bg-green-600"
            }

          `}
        >
          ON
        </button>

        <button
          onClick={() => setMode("off")}
          className={`

            py-3 rounded-2xl
            font-bold
            transition-all duration-300
            cursor-pointer

            ${!isOn && !isAuto
              ? "bg-red-500"
              : "bg-slate-700 hover:bg-red-600"
            }

          `}
        >
          OFF
        </button>

        <button
          onClick={() => setMode("auto")}
          className={`

            py-3 rounded-2xl
            font-bold
            transition-all duration-300
            cursor-pointer

            ${isAuto
              ? "bg-yellow-400 text-black"
              : "bg-slate-700 hover:bg-yellow-400 hover:text-black"
            }

          `}
        >
          AUTO
        </button>

      </div>

    </div>
  );
}

export default LightCard;