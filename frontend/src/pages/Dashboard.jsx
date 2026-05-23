import Navbar from "../components/Navbar";
import InfoCard from "../components/InfoCard";
import LightCard from "../components/LightCard";
import { useEffect, useState } from "react";
import axios from "axios";

function Dashboard() {

  const API = "http://127.0.0.1:8000";

  const [telemetria, setTelemetria] = useState({
    temp: 0,
    hum: 0,
    oscuro: 0,
    dist: 0,
    manA: "0",
    manB: "0",
    actualizado: ""
  });

  // Obtener telemetría cada 2 segundos
  useEffect(() => {

    const obtenerDatos = async () => {

      try {

        const res = await axios.get(`${API}/api/telemetria`);

        setTelemetria(res.data);

      } catch (error) {

        console.error("Error obteniendo telemetría", error);

      }
    };

    obtenerDatos();

    const intervalo = setInterval(obtenerDatos, 2000);

    return () => clearInterval(intervalo);

  }, []);

  // CONTROL LED A
  const controlarLedA = async (comando) => {

    try {

      await axios.post(`${API}/api/hardware/ledA/${comando}`);

      setTelemetria((prev) => ({
        ...prev,
        manA:
          comando === "on"
            ? "1"
            : comando === "off"
            ? "0"
            : "AUTO"
      }));

    } catch (error) {

      console.error(error);

    }
  };

  // CONTROL LED B
  const controlarLedB = async (comando) => {

    try {

      await axios.post(`${API}/api/hardware/ledB/${comando}`);

      setTelemetria((prev) => ({
        ...prev,
        manB:
          comando === "on"
            ? "1"
            : comando === "off"
            ? "0"
            : "AUTO"
      }));

    } catch (error) {

      console.error(error);

    }
  };

  return (

    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white p-8">

      <Navbar />

      <div className="flex items-center justify-between mb-10">

        <div>

          <h1 className="text-5xl font-extrabold tracking-wide">
            SmartLight IoT
          </h1>

          <p className="text-slate-400 mt-2">
            Control inteligente de iluminación y monitoreo ambiental
          </p>

        </div>

        <div className="bg-green-500/20 border border-green-400 px-4 py-2 rounded-xl">

          <p className="text-green-400 font-semibold">
            Sistema Online
          </p>

        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

        {/* LUZ ZONA A */}

        <LightCard
          title="Luz Zona A"
          mode={
            telemetria.manA === "AUTO"
              ? "auto"
              : telemetria.manA === "1"
              ? "on"
              : "off"
          }
          setMode={(modo) => controlarLedA(modo)}
        />

        {/* LUZ ZONA B */}

        <LightCard
          title="Luz Zona B"
          mode={
            telemetria.manB === "AUTO"
              ? "auto"
              : telemetria.manB === "1"
              ? "on"
              : "off"
          }
          setMode={(modo) => controlarLedB(modo)}
        />

        {/* TARJETAS INFO */}

        <InfoCard
          title="Temperatura"
          value={`${telemetria.temp} °C`}
          color="text-orange-400"
        />

        <InfoCard
          title="Humedad"
          value={`${telemetria.hum} %`}
          color="text-cyan-400"
        />

        <InfoCard
          title="Distancia"
          value={`${telemetria.dist} cm`}
          color="text-green-400"
        />

        <InfoCard
          title="Oscuridad"
          value={telemetria.oscuro ? "Detectada" : "No"}
          color="text-yellow-400"
        />

        <InfoCard
          title="Última actualización"
          value={telemetria.actualizado}
          color="text-purple-400"
        />

      </div>

    </div>

  );
}

export default Dashboard;