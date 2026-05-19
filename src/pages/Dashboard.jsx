import Navbar from "../components/Navbar";
import InfoCard from "../components/InfoCard";

function Dashboard() {

  return (

    <div className="min-h-screen bg-slate-900 text-white p-8">

      <Navbar />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <InfoCard
          title="Temperatura"
          value="26°C"
          color="text-orange-400"
        />

        <InfoCard
          title="Humedad"
          value="65%"
          color="text-blue-400"
        />

        <InfoCard
          title="Movimiento"
          value="Detectado"
          color="text-red-400"
        />

        <InfoCard
          title="Consumo"
          value="120W"
          color="text-yellow-400"
        />

        <InfoCard
          title="Modo"
          value="Automático"
          color="text-green-400"
        />

      </div>

    </div>
  );
}

export default Dashboard;