import { useEffect, useState } from "react";
import { db, auth } from "../lib/firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from "firebase/auth";

export default function Home() {
  const [user, setUser] = useState(null);
  const [productos, setProductos] = useState([]);
  const [vista, setVista] = useState("home");

  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [categoria, setCategoria] = useState("Comida");
  const [imagen, setImagen] = useState("");
  const [busqueda, setBusqueda] = useState("");

  const provider = new GoogleAuthProvider();

  const categorias = ["Comida", "Ropa", "Hogar", "Servicios", "Otros"];

  const cargar = async () => {
    const snap = await getDocs(collection(db, "productos"));

    const lista = snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));

    lista.sort((a, b) => {
      if (!a.fecha || !b.fecha) return 0;
      return b.fecha.seconds - a.fecha.seconds;
    });

    setProductos(lista);
  };

  useEffect(() => {
    cargar();
  }, []);

  const login = async () => {
    const result = await signInWithPopup(auth, provider);
    setUser(result.user);
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const subirImagen = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setImagen(reader.result);
    reader.readAsDataURL(file);
  };

  const publicar = async () => {
    if (!nombre || !precio) return;

    await addDoc(collection(db, "productos"), {
      nombre,
      precio,
      categoria,
      imagen,
      usuario: user ? user.displayName : "invitado",
      fecha: new Date()
    });

    setNombre("");
    setPrecio("");
    setImagen("");
    cargar();
  };

  const whatsapp = (p) => {
    const msg = `Producto: ${p.nombre} 💲${p.precio}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`);
  };

  const misProductos = user
    ? productos.filter(p => p.usuario === user.displayName)
    : [];

  const productosFiltrados = productos.filter(p =>
    p.nombre?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div style={styles.container}>

      {/* HEADER */}
      <div style={styles.header}>
        <h2 style={{ margin: 0 }}>🛍 Mercado Junín</h2>

        <div style={styles.headerRight}>
          {user ? (
            <>
              <span style={styles.user}>👤 {user.displayName}</span>
              <button onClick={logout} style={styles.btnSmall}>Salir</button>
            </>
          ) : (
            <button onClick={login} style={styles.btnSmall}>Entrar</button>
          )}
        </div>
      </div>

      {/* BUSCADOR */}
      <input
        placeholder="🔍 Buscar productos..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        style={styles.search}
      />

      {/* MENU */}
      <div style={styles.menu}>
        <button onClick={() => setVista("home")} style={styles.menuBtn}>Inicio</button>
        <button onClick={() => setVista("mis")} style={styles.menuBtn}>Mis publicaciones</button>
      </div>

      {/* FORM */}
      {vista === "home" && (
        <div style={styles.cardForm}>

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

          <input type="file" onChange={subirImagen} style={styles.input} />

          <button onClick={publicar} style={styles.btnPrimary}>
            Publicar producto
          </button>

        </div>
      )}

      {/* PRODUCTOS */}
      {vista === "home" && (
        <div style={styles.grid}>
          {productosFiltrados.map(p => (
            <div key={p.id} style={styles.card}>

              {p.imagen && (
                <img src={p.imagen} style={styles.img} />
              )}

              <div style={styles.info}>
                <h3>{p.nombre}</h3>
                <p style={styles.price}>💲 {p.precio}</p>
                <p style={styles.cat}>{p.categoria}</p>
              </div>

              <button onClick={() => whatsapp(p)} style={styles.wa}>
                WhatsApp
              </button>

            </div>
          ))}
        </div>
      )}

      {/* MIS PUBLICACIONES */}
      {vista === "mis" && user && (
        <>
          <h3>📦 Mis productos</h3>

          <div style={styles.grid}>
            {misProductos.map(p => (
              <div key={p.id} style={styles.card}>
                {p.imagen && (
                  <img src={p.imagen} style={styles.img} />
                )}
                <h4>{p.nombre}</h4>
                <p>💲 {p.precio}</p>
              </div>
            ))}
          </div>
        </>
      )}

    </div>
  );
}

const styles = {
  container: {
    background: "#ffe600",
    minHeight: "100vh",
    padding: 15,
    fontFamily: "Arial"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15
  },
  headerRight: {
    display: "flex",
    gap: 10,
    alignItems: "center"
  },
  user: {
    fontSize: 12
  },
  search: {
    width: "100%",
    padding: 12,
    borderRadius: 8,
    border: "none",
    marginBottom: 10
  },
  menu: {
    display: "flex",
    gap: 10,
    marginBottom: 15
  },
  menuBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    border: "none",
    background: "#3483fa",
    color: "white"
  },
  cardForm: {
    background: "white",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
  },
  input: {
    width: "100%",
    padding: 10,
    marginBottom: 10,
    borderRadius: 6,
    border: "1px solid #ddd"
  },
  btnPrimary: {
    width: "100%",
    padding: 12,
    background: "#3483fa",
    color: "white",
    border: "none",
    borderRadius: 8
  },
  btnSmall: {
    padding: 6,
    background: "#3483fa",
    color: "white",
    border: "none",
    borderRadius: 6
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10
  },
  card: {
    background: "white",
    borderRadius: 12,
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
  },
  img: {
    width: "100%",
    height: 120,
    objectFit: "cover"
  },
  info: {
    padding: 10
  },
  price: {
    fontWeight: "bold",
    margin: "5px 0"
  },
  cat: {
    fontSize: 12,
    color: "#555"
  },
  wa: {
    width: "100%",
    padding: 10,
    background: "#25D366",
    color: "white",
    border: "none"
  }
};
