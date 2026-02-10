import { useAuth } from "../context/AuthContext";

const Welcome = () => {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold">Welcome, {user.name}</h1>
      <p className="text-neutral-700">Select a section from the sidebar.</p>
    </div>
  );
};

export default Welcome;