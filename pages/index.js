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
  const [vista, setVista] = useState("home");
  const [vendedor, setVendedor] = useState(null);

  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");

  const provider = new GoogleAuthProvider();

  const cargar = async () => {
    const snap = await getDocs(collection(db, "productos"));
    const lista = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    setProductos(lista);
  };

  useEffect(() => {
    cargar();
  }, []);

  const login = async () => {
    const res = await signInWithPopup(auth, provider);
    setUser(res.user);
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const publicar = async () => {
    if (!user) return alert("Iniciá sesión");

    await addDoc(collection(db, "productos"), {
      nombre,
      precio,
      usuario: user.displayName,
      whatsapp: user.phoneNumber || "",
      fecha: new Date(),
      destacado: false
    });

    setNombre("");
    setPrecio("");
    cargar();
  };

  const abrirPerfil = (userName) => {
    setVendedor(userName);
    setVista("perfil");
  };

  const volver = () => {
    setVista("home");
    setVendedor(null);
  };

  const productosVendedor = productos.filter(
    p => p.usuario === vendedor
  );

  return (
    <div style={{ padding: 20, background: "#ffe600", minHeight: "100vh" }}>
      <h2>🛍 Mercado Junín</h2>

      {user ? (
        <>
          <p>👤 {user.displayName}</p>
          <button onClick={logout}>Salir</button>
        </>
      ) : (
        <button onClick={login}>Entrar con Google</button>
      )}

      <hr />

      {vista === "home" && (
        <>
          <h3>Publicar</h3>

          <input
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />

          <input
            placeholder="Precio"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
          />

          <button onClick={publicar}>Publicar</button>

          <hr />

          <h3>Productos</h3>

          {productos.map(p => (
            <div key={p.id} style={{ background: "white", margin: 10, padding: 10 }}>
              <b>{p.nombre}</b> - ${p.precio}

              <br />

              <button onClick={() => abrirPerfil(p.usuario)}>
                Ver tienda
              </button>
            </div>
          ))}
        </>
      )}

      {vista === "perfil" && (
        <>
          <button onClick={volver}>⬅ Volver</button>

          <h3>🏪 Tienda de {vendedor}</h3>

          {productosVendedor.map(p => (
            <div key={p.id} style={{ background: "white", margin: 10, padding: 10 }}>
              <b>{p.nombre}</b> - ${p.precio}

              <br />

              <button
                onClick={() =>
                  window.open(
                    `https://wa.me/?text=${encodeURIComponent(
                      "Hola, te consulto por " + p.nombre
                    )}`
                  )
                }
              >
                WhatsApp
              </button>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
