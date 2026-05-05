import { useState, useEffect } from "react";

export default function Home() {
  const [mensaje, setMensaje] = useState("Cargando...");

  useEffect(() => {
    setMensaje("MERCADO JUNIN FUNCIONANDO 🚀");
  }, []);

  return (
    <div style={{
      backgroundColor: "#ffe600",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "26px",
      fontWeight: "bold",
      textAlign: "center",
      padding: 20
    }}>
      {mensaje}
    </div>
  );
}
