import Navbar from "../components/Navbar";
import InfoCard from "../components/InfoCard";
import LightCard from "../components/LightCard";

import { useEffect, useState } from "react";
import axios from "axios";

function Dashboard() {

  const [telemetria, setTelemetria] = useState({
    temp: 0,
    hum: 0,
    oscuro: 0,
    dist: 0,
    manA: "0",
    manB: "0",
    actualizado: "Nunca"
  });

  // =========================
  // OBTENER DATOS DEL BACKEND
  // =========================

  const obtenerTelemetria = async () => {

    try {

      const response = await axios.get(
        "http://localhost:8000/api/telemetria"
      );

      setTelemetria(response.data);

    } catch (error) {

      console.error("Error obteniendo telemetría:", error);

    }
  };

  // =========================
  // CONTROL LED A
  // =========================

  const controlarLedA = async () => {

    try {

      const comando =
        telemetria.manA === "1" ? "off" : "on";

      await axios.post(
        `http://localhost:8000/api/hardware/ledA/${comando}`
      );

      obtenerTelemetria();

    } catch (error) {

      console.error(error);

    }
  };

  // =========================
  // CONTROL LED B
  // =========================

  const controlarLedB = async () => {

    try {

      const comando =
        telemetria.manB === "1" ? "off" : "on";

      await axios.post(
        `http://localhost:8000/api/hardware/ledB/${comando}`
      );

      obtenerTelemetria();

    } catch (error) {

      console.error(error);

    }
  };

  // =========================
  // CARGAR DATOS AUTOMÁTICAMENTE
  // =========================

  useEffect(() => {

    obtenerTelemetria();

    const intervalo = setInterval(() => {

      obtenerTelemetria();

    }, 2000);

    return () => clearInterval(intervalo);

  }, []);

  return (

    <div className="min-h-screen bg-slate-900 text-white p-8">

      <Navbar />

      <h1 className="text-4xl font-bold mb-8">
        SmartLight Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <LightCard
          title="Zona A"
          isOn={telemetria.manA === "1"}
          toggleLight={controlarLedA}
        />

        <LightCard
          title="Zona B"
          isOn={telemetria.manB === "1"}
          toggleLight={controlarLedB}
        />

        <InfoCard
          title="Temperatura"
          value={`${telemetria.temp} °C`}
          color="text-orange-400"
        />

        <InfoCard
          title="Humedad"
          value={`${telemetria.hum}%`}
          color="text-blue-400"
        />

        <InfoCard
          title="Oscuridad"
          value={telemetria.oscuro ? "Oscuro" : "Iluminado"}
          color="text-purple-400"
        />

        <InfoCard
          title="Distancia"
          value={`${telemetria.dist} cm`}
          color="text-cyan-400"
        />

        <InfoCard
          title="Última actualización"
          value={telemetria.actualizado}
          color="text-green-400"
        />

      </div>

    </div>
  );
}

dgdgg

export default Dashboard;