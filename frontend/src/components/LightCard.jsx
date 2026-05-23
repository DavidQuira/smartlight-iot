function LightCard({ title, isOn, toggleLight }) {

  return (

    <div className={`

      p-6 rounded-3xl border
      backdrop-blur-lg
      transition-all duration-300
      hover:scale-105

      ${isOn
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

          ${isOn
            ? "bg-green-400 animate-pulse"
            : "bg-red-500"
          }

        `}></div>

      </div>

      <p className={`

        text-5xl font-extrabold mb-8

        ${isOn
          ? "text-green-400"
          : "text-red-400"
        }

      `}>
        {isOn ? "ON" : "OFF"}
      </p>

      <button
        onClick={toggleLight}
        className={`

          w-full py-3 rounded-2xl
          font-bold text-lg
          transition-all duration-300
          cursor-pointer

          ${isOn
            ? "bg-red-600 hover:bg-red-700"
            : "bg-green-600 hover:bg-green-700"
          }

        `}
      >
        {isOn ? "Apagar" : "Encender"}
      </button>

    </div>
  );
}

export default LightCard;