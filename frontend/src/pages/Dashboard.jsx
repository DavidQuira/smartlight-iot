import Navbar from "../components/Navbar";
import InfoCard from "../components/InfoCard";
import LightCard from "../components/LightCard";
import { useEffect, useState, useRef } from "react";
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

  // Estados locales para el UI (evitan depender exclusivamente de los valores 0/1 del backend)
  const [modeA, setModeA] = useState(
    telemetria.manA === "1" ? "on" : "off"
  );
  const [modeB, setModeB] = useState(
    telemetria.manB === "1" ? "on" : "off"
  );

  // Overrides basados en timestamp: cuando el usuario cambia el modo en el UI,
  // preferimos su elección como fuente de la verdad por hasta `maxOverride` ms.
  // Esto evita que el backend (que solo reporta 0/1) reseteé la UI rápidamente.
  const maxOverride = 5 * 60 * 1000; // 5 minutos
  const lastCommandA = useRef(null); // { value: 'on'|'off'|'auto', ts: number }
  const lastCommandB = useRef(null);

  // Obtener telemetría cada 2 segundos
  useEffect(() => {

    const obtenerDatos = async () => {

      try {

        const res = await axios.get(`${API}/api/telemetria`);


        setTelemetria(res.data);

        // Sincronizamos los modos desde el backend solo si no hay un comando
        // local reciente (override). Si hubo un comando local dentro de
        // `maxOverride`, respetamos la elección del usuario.
        const now = Date.now();

        if (
          !lastCommandA.current ||
          now - lastCommandA.current.ts > maxOverride
        ) {
          const newModeA =
            res.data.manA === "AUTO" ? "auto" : res.data.manA === "1" ? "on" : "off";
          setModeA(newModeA);
          lastCommandA.current = null;
        }

        if (
          !lastCommandB.current ||
          now - lastCommandB.current.ts > maxOverride
        ) {
          const newModeB =
            res.data.manB === "AUTO" ? "auto" : res.data.manB === "1" ? "on" : "off";
          setModeB(newModeB);
          lastCommandB.current = null;
        }

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

      // Actualizamos el estado local inmediatamente y registramos el comando
      // con timestamp para que la UI sea la fuente de la verdad durante
      // `maxOverride`.
      setModeA(comando === "on" ? "on" : comando === "off" ? "off" : "auto");
      lastCommandA.current = { value: comando, ts: Date.now() };

      // También actualizamos telemetría local para mostrar cambio inmediato
      setTelemetria((prev) => ({
        ...prev,
        manA: comando === "on" ? "1" : comando === "off" ? "0" : "AUTO",
      }));

    } catch (error) {

      console.error(error);

    }
  };

  // CONTROL LED B
  const controlarLedB = async (comando) => {

    try {

      await axios.post(`${API}/api/hardware/ledB/${comando}`);

      // Actualizamos el estado local inmediatamente y registramos el comando
      // con timestamp para que la UI sea la fuente de la verdad durante
      // `maxOverride`.
      setModeB(comando === "on" ? "on" : comando === "off" ? "off" : "auto");
      lastCommandB.current = { value: comando, ts: Date.now() };

      setTelemetria((prev) => ({
        ...prev,
        manB: comando === "on" ? "1" : comando === "off" ? "0" : "AUTO",
      }));

    } catch (error) {

      console.error(error);

    }
  };

  // Cleanup: limpiar timers de override al desmontar
  useEffect(() => {
    return () => {
      // limpiar refs de último comando para evitar fugas
      lastCommandA.current = null;
      lastCommandB.current = null;
    };
  }, []);

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
          mode={modeA}
          setMode={(modo) => controlarLedA(modo)}
        />

        {/* LUZ ZONA B */}

        <LightCard
          title="Luz Zona B"
          mode={modeB}
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