import { useEffect, useState } from "react";
import { db, auth } from "../lib/firebase";
import {
  collection,
  addDoc,
  getDocs
} from "firebase/firestore";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from "firebase/auth";

export default function Home() {
  const [user, setUser] = useState(null);

  const [productos, setProductos] = useState([]);
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [categoria, setCategoria] = useState("Comida");
  const [imagen, setImagen] = useState("");

  const provider = new GoogleAuthProvider();

  const categorias = ["Comida", "Ropa", "Hogar", "Servicios", "Otros"];

  const cargar = async () => {
    const snap = await getDocs(collection(db, "productos"));
    setProductos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
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
      usuario: user ? user.displayName : "invitado"
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

  return (
    <div style={styles.container}>

      {/* LOGIN */}
      <div style={styles.nav}>
        {user ? (
          <>
            <p>👤 {user.displayName}</p>
            <button onClick={logout}>Cerrar sesión</button>
          </>
        ) : (
          <button onClick={login}>Entrar con Google</button>
        )}
      </div>

      <h1>🛍 Mercado Junín PRO</h1>

      {/* FORM */}
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
          {categorias.map(c => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <input type="file" onChange={subirImagen} style={styles.input} />

        <button onClick={publicar} style={styles.btn}>
          Publicar producto
        </button>
      </div>

      {/* PRODUCTOS */}
      {productos.map(p => (
        <div key={p.id} style={styles.card}>

          {p.imagen && (
            <img src={p.imagen} style={styles.img} />
          )}

          <h3>{p.nombre}</h3>
          <p>💲 {p.precio}</p>
          <p>📦 {p.categoria}</p>
          <p>👤 {p.usuario}</p>

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
  nav: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 20
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
