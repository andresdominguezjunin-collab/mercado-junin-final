"use client";
import { useEffect, useState } from "react";
import { db, auth } from "../lib/firebase";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  increment
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

  // 💥 CLICK EN SPONSOR (CON TRACKING)
  const abrirSponsor = async (s) => {
    try {
      // incrementar clicks
      await updateDoc(doc(db, "sponsors", s.id), {
        clicks: increment(1),
      });

      // abrir link
      if (s.link) {
        window.open(s.link, "_blank");
      }

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

      {/* 🏆 SPONSORS */}
      {vista === "home" && (
        <>
          <h3>🏆 Sponsors</h3>

          <div style={{ display: "flex", gap: 10, overflowX: "auto" }}>
            {sponsors
              .filter(s => s.activo)
              .map(s => (
                <div
                  key={s.id}
                  style={{
                    background: "white",
                    padding: 10,
                    cursor: "pointer"
                  }}
                  onClick={() => abrirSponsor(s)}
                >
                  <img
                    src={s.logo || "https://via.placeholder.com/80"}
                    style={{ width: 80, height: 80, objectFit: "contain" }}
                  />

                  <p style={{ fontSize: 12 }}>
                    👁 {s.clicks || 0}
                  </p>
                </div>
              ))}
          </div>

          <hr />
        </>
      )}

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
