function LightCard({ title, isOn, toggleLight }) {

  return (

    <div className="bg-slate-800 p-6 rounded-2xl shadow-xl">

      <h2 className="text-2xl mb-4">
        {title}
      </h2>

      <p className={`text-3xl font-bold mb-6 ${
        isOn ? "text-green-400" : "text-red-400"
      }`}>
        {isOn ? "ON" : "OFF"}
      </p>

      <button
        onClick={toggleLight}
        className={`px-4 py-2 rounded-lg font-bold ${
          isOn
            ? "bg-red-600 hover:bg-red-700"
            : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {isOn ? "Apagar" : "Encender"}
      </button>

    </div>
  );
}

export default LightCard;