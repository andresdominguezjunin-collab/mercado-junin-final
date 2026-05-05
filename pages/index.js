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

  // 🔥 CARGAR PRODUCTOS
  const cargar = async () => {
    const snap = await getDocs(collection(db, "productos"));
    setProductos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    cargar();
  }, []);

  // 🔐 LOGIN
  const login = async () => {
    const result = await signInWithPopup(auth, provider);
    setUser(result.user);
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  // 📸 IMAGEN
  const subirImagen = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagen(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // 📦 PUBLICAR
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

  // 💬 WHATSAPP
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

      {/* NAV */}
      <div style={styles.nav}>
        {user ? (
          <>
            <span>👤 {user.displayName}</span>
            <button onClick={logout}>Salir</button>
          </>
        ) : (
          <button onClick={login}>Entrar con Google</button>
        )}

        <button onClick={() => setVista("home")}>Inicio</button>
        <button onClick={() => setVista("mis")}>Mis publicaciones</button>
      </div>

      <h1>🛍 Mercado Junín</h1>

      {/* BUSCADOR */}
      <input
        placeholder="Buscar producto..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        style={styles.input}
      />

      {/* HOME */}
      {vista === "home" && (
        <>
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

            <input type="file" onChange={subirImagen} style={styles.input} />

            <button onClick={publicar} style={styles.btn}>
              Publicar
            </button>

          </div>

          {productosFiltrados.map(p => (
            <div key={p.id} style={styles.card}>

              {p.imagen
