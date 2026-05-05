import { useState } from "react";

export default function Home() {
  const [productos, setProductos] = useState([]);
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [categoria, setCategoria] = useState("Comida");
  const [imagen, setImagen] = useState("");
  const [busqueda, setBusqueda] = useState("");

  const categorias = ["Comida", "Ropa", "Hogar", "Servicios", "Otros"];

  const agregarProducto = () => {
    if (!nombre || !precio) return;

    const nuevo = {
      id: Date.now(),
      nombre,
      precio,
      categoria,
      imagen
    };

    setProductos([nuevo, ...productos]);

    setNombre("");
    setPrecio("");
    setImagen("");
  };

  const subirImagen = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagen(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const compartir = (p) => {
    const texto = `Mirá este producto:
${p.nombre}
💲 ${p.precio}
📦 ${p.categoria}`;

    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`);
  };

  const filtrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div style={styles.container}>

      <h1>🛍 Mercado Junín</h1>

      {/* BUSCADOR */}
      <input
        placeholder="Buscar producto..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        style={styles.input}
      />

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

        <input
          type="file"
          accept="image/*"
          onChange={subirImagen}
          style={styles.input}
        />

        <button onClick={agregarProducto} style={styles.button}>
          Publicar
        </button>
      </div>

      {/* PRODUCTOS */}
      <div style={{ width: "100%", maxWidth: 500 }}>
        {filtrados.map(p => (
          <div key={p.id} style={styles.producto}>

            {p.imagen && (
              <img src={p.imagen} style={styles.img} />
            )}

            <h3>{p.nombre}</h3>
            <p>💲 {p.precio}</p>
            <p>📦 {p.categoria}</p>

            <div style={{ display: "flex", gap: 10 }}>

              <button
                onClick={() => compartir(p)}
                style={styles.wa}
              >
                WhatsApp
              </button>

              <button
                onClick={() => alert("Producto compartido")}
                style={styles.share}
              >
                Compartir
              </button>

            </div>

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
  },
  img: {
    width: "100%",
    borderRadius: 10,
    marginBottom: 10
  },
  wa: {
    flex: 1,
    background: "#25D366",
    color: "white",
    border: "none",
    padding: 10,
    borderRadius: 8
  },
  share: {
    flex: 1,
    background: "#333",
    color: "white",
    border: "none",
    padding: 10,
    borderRadius: 8
  }
};
