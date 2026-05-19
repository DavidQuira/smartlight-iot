import Navbar from "../components/Navbar";
import InfoCard from "../components/InfoCard";
import LightCard from "../components/LightCard";
import { useState } from "react";

function Dashboard() {

  const [light1, setLight1] = useState(false);
  const [light2, setLight2] = useState(true);

  return (

    <div className="min-h-screen bg-slate-900 text-white p-8">

      <Navbar />

      <h1 className="text-4xl font-bold mb-8">
        SmartLight Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <LightCard
          title="Luz Sala"
          isOn={light1}
          toggleLight={() => setLight1(!light1)}
        />

        <LightCard
          title="Luz Cocina"
          isOn={light2}
          toggleLight={() => setLight2(!light2)}
        />

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