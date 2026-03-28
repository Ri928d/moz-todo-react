import { useAuth } from "../AuthContext";

export default function Home() {
  const { isLoggedIn, username } = useAuth();

  return (
    <div style={{ padding: "40px", color: "black", background: "white" }}>
      <h1>Inventory App</h1>
      <p>App is rendering.</p>
      <p>Logged in: {isLoggedIn ? "Yes" : "No"}</p>
      <p>User: {username || "None"}</p>
    </div>
  );
}