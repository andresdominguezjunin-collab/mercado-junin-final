"use client";
import { useEffect, useState } from "react";
import { db, auth } from "../lib/firebase";
import {
  collection,
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

  // 🏆 PAGO SPONSOR
  const serSponsor = async () => {
    try {
      const res = await fetch("/api/pago", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tipo: "sponsor",
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

  // 🔥 FILTRO DE SPONSORS ACTIVOS Y NO VENCIDOS
  const sponsorsActivos = sponsors.filter(s => {
    if (!s.activo) return false;

    if (!s.vence) return true;

    const hoy = new Date();
    const vencimiento = new Date(s.vence.seconds * 1000);

    return vencimiento > hoy;
  });

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
          {/* 🏆 SPONSORS */}
          <h3>🏆 Sponsors</h3>

          <div style={{ display: "flex", gap: 10, overflowX: "auto" }}>
            {sponsorsActivos.map(s => (
              <div key={s.id} style={{ background: "white", padding: 10 }}>
                <img
                  src={s.logo || "https://via.placeholder.com/80"}
                  style={{ width: 80, height: 80, objectFit: "contain" }}
                  onClick={() => window.open(s.link || "#")}
                />
              </div>
            ))}
          </div>

          <br />

          {/* 💥 BOTÓN SPONSOR */}
          <button
            onClick={serSponsor}
            style={{
              background: "black",
              color: "white",
              padding: 10,
              borderRadius: 10,
              width: "100%",
            }}
          >
            🚀 Quiero ser sponsor
          </button>

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
