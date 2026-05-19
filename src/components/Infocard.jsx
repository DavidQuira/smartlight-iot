function InfoCard({ title, value, color }) {

  return (

    <div className="bg-slate-800 p-6 rounded-2xl shadow-xl">

      <h2 className="text-xl mb-4">
        {title}
      </h2>

      <p className={`text-3xl font-bold ${color}`}>
        {value}
      </p>

    </div>
  );
}

export default InfoCard;