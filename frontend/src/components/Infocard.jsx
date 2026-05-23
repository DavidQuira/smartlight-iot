function InfoCard({ title, value, color }) {

  return (

    <div className="

      bg-slate-800/70
      border border-slate-700
      backdrop-blur-lg
      p-6 rounded-3xl
      shadow-xl
      hover:scale-105
      transition-all duration-300

    ">

      <h2 className="text-slate-400 text-lg mb-4">
        {title}
      </h2>

      <p className={`text-4xl font-extrabold ${color}`}>
        {value}
      </p>

    </div>
  );
}

export default InfoCard;