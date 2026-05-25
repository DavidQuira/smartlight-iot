import Navbar from "../components/Navbar";
import grafanaScreenshot from "../assets/grafana.png";

function Grafana() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-blue-950 text-white px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-7xl flex-col">
        <Navbar />

        <div className="mb-6 flex flex-col gap-4 rounded-4xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl sm:p-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 inline-flex rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
              Grafana Live
            </p>
            <h1 className="text-3xl font-extrabold tracking-wide sm:text-4xl">
              Monitoreo de telemetría en tiempo real
            </h1>
            <p className="mt-3 max-w-3xl text-sm text-slate-300 sm:text-base">
              Vista embebida del panel público para seguir métricas y eventos del sistema sin salir de SmartLight.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:min-w-75 lg:text-right">
            <div className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Acceso</p>
              <p className="mt-1 font-semibold text-emerald-400">Público embebido</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Vista</p>
              <p className="mt-1 font-semibold text-cyan-300">Responsive iframe</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden rounded-4xl border border-white/10 bg-slate-950/40 shadow-[0_0_50px_rgba(8,15,35,0.45)]">
          <div className="flex h-[72vh] min-h-140 w-full items-center justify-center p-3 sm:p-4">
            <img
              src={grafanaScreenshot}
              alt="Captura del dashboard de Grafana"
              className="h-full w-full rounded-3xl object-contain shadow-[0_0_35px_rgba(8,15,35,0.35)]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Grafana;