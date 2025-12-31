import { Card } from "@mantine/core";
import { useUserStore } from "../stores/userStore";
import "./App.css";

function App() {
  const fullName = useUserStore((s) => s.fullName);
  return (
    <>
      <div>hi</div>
      <Card shadow="sm" padding="lg">
        <h1>Hello, Mantine!</h1>
        <h2>{fullName}</h2>
      </Card>
    </>
  )
}

export default App
