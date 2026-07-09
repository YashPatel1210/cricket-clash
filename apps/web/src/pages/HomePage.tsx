export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold">
          🏏 Cricket Clash
        </h1>

        <p className="mt-4 text-slate-300 text-xl">
          Welcome to our Cricket Simulation Game
        </p>

        <button className="mt-8 rounded-xl bg-green-600 px-8 py-3 text-lg font-semibold hover:bg-green-700">
          Start Match
        </button>
      </div>
    </div>
  );
}