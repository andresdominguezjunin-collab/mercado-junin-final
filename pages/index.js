import { useState } from "react";

export default function Home() {
  const [productos, setProductos] = useState([]);
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [categoria, setCategoria] = useState("Comida");

  const categorias = ["Comida", "Ropa", "Hogar", "Servicios", "Otros"];

  const agregarProducto = () => {
    if (!nombre || !precio) return;

    const nuevo = {
      id: Date.now(),
      nombre,
      precio,
      categoria
    };

    setProductos([nuevo, ...productos]);
    setNombre("");
    setPrecio("");
  };

  return (
    <div style={styles.container}>

      <h1>🛍 Mercado Junín</h1>

      {/* FORM */}
      <div style={styles.card}>
        <input
          placeholder="Nombre del producto"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          style={styles.input}
        />

        <input
          placeholder="Precio"
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
          style={styles.input}
        />

        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          style={styles.input}
        >
          {categorias.map(c => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <button onClick={agregarProducto} style={styles.button}>
          Publicar
        </button>
      </div>

      {/* LISTA */}
      <div style={{ width: "100%", maxWidth: 500 }}>
        {productos.map(p => (
          <div key={p.id} style={styles.producto}>
            <h3>{p.nombre}</h3>
            <p>💲 {p.precio}</p>
            <p>📦 {p.categoria}</p>
          </div>
        ))}
      </div>

    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#ffe600",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: 20,
    fontFamily: "Arial"
  },
  card: {
    background: "white",
    padding: 15,
    borderRadius: 10,
    width: "100%",
    maxWidth: 500,
    marginBottom: 20
  },
  input: {
    width: "100%",
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    border: "1px solid #ccc"
  },
  button: {
    width: "100%",
    padding: 10,
    background: "#3483fa",
    color: "white",
    border: "none",
    borderRadius: 8
  },
  producto: {
    background: "white",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10
  }
};
