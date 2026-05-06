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

    await addDoc(collection(db, "sponsors"), {
      nombre,
      logo,
      link,
      activo: true,
    });

    alert("Sponsor creado 🚀");
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
        Guardar Sponsor
      </button>
    </div>
  );
}
