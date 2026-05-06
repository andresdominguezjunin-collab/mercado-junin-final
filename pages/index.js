import { useEffect, useState } from "react";
import { db, auth } from "../lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc
} from "firebase/firestore";
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

    let lista = snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));

    lista.sort((a, b) => {
      if (a.destacado && !b.destacado) return -1;
      if (!a.destacado && b.destacado) return 1;
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
      fecha: new Date(),
      destacado: false
    });

    setNombre("");
    setPrecio("");
    setImagen("");
    cargar();
  };

  // 🔥 DESTACAR CON PAGO
  const destacar = async (p) => {
    try {
      const res = await fetch("/api/pago", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productoId: p.id,
        }),
      });

      const data = await res.json();

      window.open(
        `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=${data.id}`,
        "_blank"
      );

    } catch (err) {
      alert("Error al iniciar pago");
    }
  };

  const borrar = async (id) => {
    await deleteDoc(doc(db, "productos", id));
    cargar();
  };

  const editar = async (p) => {
    const nuevoPrecio = prompt("Nuevo precio:", p.precio);
    if (!nuevoPrecio) return;

    await updateDoc(doc(db, "productos", p.id), {
      precio: nuevoPrecio
    });

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

      <div style={styles.header}>
        <h2>🛍 Mercado Junín</h2>

        <div>
          {user ? (
            <>
              <span>👤 {user.displayName}</span>
              <button onClick={logout}>Salir</button>
            </>
          ) : (
            <button onClick={login}>Entrar</button>
          )}
        </div>
      </div>

      <input
        placeholder="🔍 Buscar..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        style={styles.search}
      />

      <div style={styles.menu}>
        <button onClick={() => setVista("home")}>Inicio</button>
        <button onClick={() => setVista("mis")}>Mis publicaciones</button>
      </div>

      {vista === "home" && (
        <div style={styles.form}>
          <input placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
          <input placeholder="Precio" value={precio} onChange={(e) => setPrecio(e.target.value)} />
          <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
            {categorias.map(c => <option key={c}>{c}</option>)}
          </select>
          <input type="file" onChange={subirImagen} />
          <button onClick={publicar}>Publicar</button>
        </div>
      )}

      {vista === "home" && (
        <div style={styles.grid}>
          {productosFiltrados.map(p => (
            <div
              key={p.id}
              style={{
                ...styles.card,
                border: p.destacado ? "3px solid gold" : "none"
              }}
            >

              {p.destacado && <div style={styles.badge}>⭐ Destacado</div>}

              {p.imagen && <img src={p.imagen} style={styles.img} />}

              <h3>{p.nombre}</h3>
              <p>💲 {p.precio}</p>

              <button onClick={() => whatsapp(p)} style={styles.wa}>
                WhatsApp
              </button>

            </div>
          ))}
        </div>
      )}

      {vista === "mis" && user && (
        <div>
          <h3>Mis productos</h3>

          {misProductos.map(p => (
            <div key={p.id} style={styles.card}>

              <h4>{p.nombre}</h4>
              <p>${p.precio}</p>

              <button onClick={() => editar(p)}>✏️ Editar</button>
              <button onClick={() => borrar(p.id)}>🗑 Borrar</button>
              <button onClick={() => destacar(p)}>⭐ Destacar</button>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}

const styles = {
  container: { background: "#ffe600", minHeight: "100vh", padding: 15 },
  header: { display: "flex", justifyContent: "space-between" },
  search: { width: "100%", padding: 10, margin: "10px 0" },
  menu: { display: "flex", gap: 10, marginBottom: 10 },
  form: { background: "white", padding: 10, marginBottom: 10, borderRadius: 10 },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  card: { background: "white", padding: 10, borderRadius: 10, position: "relative" },
  badge: { position: "absolute", top: 5, right: 5, background: "gold", padding: "2px 6px", fontSize: 12 },
  img: { width: "100%", height: 120, objectFit: "cover" },
  wa: { width: "100%", background: "#25D366", color: "white", padding: 8, border: "none" }
};
