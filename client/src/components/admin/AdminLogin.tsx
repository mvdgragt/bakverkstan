import { useState } from "react";
import { login } from "../../services/workshops";

const AdminLogin = ({ onLoggedIn }: { onLoggedIn: () => Promise<void> }) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      await login(password);
      setPassword("");
      await onLoggedIn();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <main className="mx-auto max-w-sm px-6 py-16">
      <h1 className="mb-6 text-2xl font-bold text-gray-800">Admin</h1>
      <form onSubmit={handleLogin} className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          <span className="mb-1 block">Lösenord</span>
          <input
            type="password"
            autoComplete="current-password"
            className="w-full rounded border border-gray-300 px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {error && <p className="text-red-700" role="alert">{error}</p>}
        <button className="w-full rounded bg-stone-700 px-5 py-2 text-white hover:bg-stone-800">Logga in</button>
      </form>
    </main>
  );
};

export default AdminLogin;
