function Login() {
  return (
    <div className="flex items-center justify-center h-screen bg-slate-900">
      
      <div className="bg-slate-800 p-10 rounded-2xl shadow-2xl w-96">

        <h1 className="text-3xl font-bold text-center mb-8">
          SmartLight IoT
        </h1>

        <input
          type="text"
          placeholder="Usuario"
          className="w-full p-3 mb-4 rounded-lg bg-slate-700 outline-none"
        />

        <input
          type="password"
          placeholder="Contraseña"
          className="w-full p-3 mb-6 rounded-lg bg-slate-700 outline-none"
        />

        <button
          className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded-lg font-bold"
        >
          Ingresar
        </button>

      </div>

    </div>
  );
}

export default Login;