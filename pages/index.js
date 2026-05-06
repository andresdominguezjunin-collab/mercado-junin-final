"use client";
import { useEffect, useState } from "react";
import { db, auth } from "../lib/firebase";
import {
  collection,
  getDocs,
  addDoc
} from "firebase/firestore";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from "firebase/auth";

export default function Home() {
  const [user, setUser] = useState(null);
  const [productos, setProductos] = useState([]);
  const [sponsors, setSponsors] = useState([]);
  const [vista, setVista] = useState("home");
  const [vendedor, setVendedor] = useState(null);

  const provider = new GoogleAuthProvider();

  const cargar = async () => {
    const prodSnap = await getDocs(collection(db, "productos"));
    const sponsSnap = await getDocs(collection(db, "sponsors"));

    setProductos(prodSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    setSponsors(sponsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
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

  const abrirPerfil = (userName) => {
    setVendedor(userName);
    setVista("perfil");
  };

  const volver = () => {
    setVista("home");
  };

  const productosVendedor = productos.filter(
    p => p.usuario === vendedor
  );

  // 💬 TRACKING + WHATSAPP
  const abrirWhatsApp = async (producto) => {
    try {
      // guardar consulta en Firebase
      await addDoc(collection(db, "mensajes"), {
        producto: producto.nombre,
        vendedor: producto.usuario,
        fecha: new Date()
      });

      // abrir WhatsApp
      const texto = `Hola, te consulto por ${producto.nombre}`;
      window.open(
        `https://wa.me/?text=${encodeURIComponent(texto)}`,
        "_blank"
      );

    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div style={{ padding: 20, background: "#ffe600", minHeight: "100vh" }}>
      <h2>🛍 Mercado Junín</h2>

      {user ? (
        <>
          <p>👤 {user.displayName}</p>
          <button onClick={logout}>Salir</button>
        </>
      ) : (
        <button onClick={login}>Entrar</button>
      )}

      <hr />

      {vista === "home" && (
        <>
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

          <h3>🏪 {vendedor}</h3>

          {productosVendedor.map(p => (
            <div key={p.id} style={{ background: "white", margin: 10, padding: 10 }}>
              <b>{p.nombre}</b> - ${p.precio}

              <br />

              <button onClick={() => abrirWhatsApp(p)}>
                WhatsApp
              </button>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
