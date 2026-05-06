import { useState } from "react";
import { db } from "../lib/firebase";
import { collection, addDoc } from "firebase/firestore";

export default function Sponsor() {
  const [nombre, setNombre] = useState("");
  const [logo, setLogo] = useState("");
  const [link, setLink] = useState("");

  const subirImagen = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setLogo(reader.result);
    reader.readAsDataURL(file);
  };

  const guardar = async () => {
    if (!nombre) return alert("Falta nombre");

    const hoy = new Date();
    const vencimiento = new Date();
    vencimiento.setDate(hoy.getDate() + 30); // 30 días

    await addDoc(collection(db, "sponsors"), {
      nombre,
      logo,
      link,
      activo: true,
      creado: hoy,
      vence: vencimiento,
    });

    alert("Sponsor activado por 30 días 🚀");

    setNombre("");
    setLogo("");
    setLink("");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>🏆 Crear Sponsor</h2>

      <input
        placeholder="Nombre del negocio"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
      />

      <br /><br />

      <input type="file" onChange={subirImagen} />

      <br /><br />

      <input
        placeholder="Link o WhatsApp"
        value={link}
        onChange={(e) => setLink(e.target.value)}
      />

      <br /><br />

      <button onClick={guardar}>
        Activar Sponsor
      </button>
    </div>
  );
}
