import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import {
  collection,
  addDoc,
  getDocs
} from "firebase/firestore";

export default function Home() {
  const [productos, setProductos] = useState([]);

  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [categoria, setCategoria] = useState("Comida");
  const [imagen, setImagen] = useState("");

  const categorias = ["Comida", "Ropa", "Hogar", "Servicios", "Otros"];

  // 🔥 CARGAR PRODUCTOS
  const cargar = async () => {
    const snap = await getDocs(collection(db, "productos"));
    const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setProductos(data);
  };

  useEffect(() => {
    cargar();
  }, []);

  // 🔥 SUBIR PRODUCTO
  const publicar = async () => {
    if (!nombre || !precio) return;

    await addDoc(collection(db, "productos"), {
      nombre,
      precio,
      categoria,
      imagen
    });

    setNombre("");
    setPrecio("");
    setImagen("");
    cargar();
  };

  const subirImagen = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => setImagen(reader.result);
    reader.readAsDataURL(file);
  };

  const whatsapp = (p) => {
    const msg = `Producto: ${p.nombre} 💲${p.precio}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`);
  };

  return (
    <div style={styles.container}>

      <h1>🛍 Mercado Junín PRO</h1>

      <div style={styles.card}>

        <input placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          style={styles.input}
        />

        <input placeholder="Precio"
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
          style={styles.input}
        />

        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          style={styles.input}
        >
          {categorias.map(c => <option key={c}>{c}</option>)}
        </select>

        <input type="file" onChange={subirImagen} style={styles.input} />

        <button onClick={publicar} style={styles.btn}>
          Publicar
        </button>

      </div>

      {productos.map(p => (
        <div key={p.id} style={styles.card}>

          {p.imagen && (
            <img src={p.imagen} style={styles.img} />
          )}

          <h3>{p.nombre}</h3>
          <p>💲 {p.precio}</p>
          <p>📦 {p.categoria}</p>

          <button onClick={() => whatsapp(p)} style={styles.wa}>
            WhatsApp
          </button>

        </div>
      ))}

    </div>
  );
}

const styles = {
  container: {
    background: "#ffe600",
    minHeight: "100vh",
    padding: 20,
    fontFamily: "Arial"
  },
  card: {
    background: "white",
    padding: 15,
    marginBottom: 15,
    borderRadius: 10
  },
  input: {
    width: "100%",
    padding: 10,
    marginBottom: 10
  },
  btn: {
    width: "100%",
    padding: 10,
    background: "#3483fa",
    color: "white",
    border: "none"
  },
  img: {
    width: "100%",
    borderRadius: 10
  },
  wa: {
    width: "100%",
    marginTop: 10,
    padding: 10,
    background: "#25D366",
    color: "white",
    border: "none"
  }
};
