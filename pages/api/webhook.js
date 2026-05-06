import mercadopago from "mercadopago";
import { db } from "../../lib/firebase";
import { doc, updateDoc, addDoc, collection } from "firebase/firestore";

mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN,
});

export default async function handler(req, res) {
  try {
    const data = req.body;

    if (data.type === "payment") {
      const payment = await mercadopago.payment.findById(data.data.id);

      if (payment.body.status === "approved") {
        const meta = payment.body.metadata;

        // ⭐ DESTACAR PRODUCTO
        if (meta.tipo === "destacar") {
          await updateDoc(doc(db, "productos", meta.productoId), {
            destacado: true,
          });
        }

        // 🏆 CREAR SPONSOR
        if (meta.tipo === "sponsor") {
          await addDoc(collection(db, "sponsors"), {
            nombre: "Nuevo Sponsor",
            logo: "",
            link: "",
            activo: true,
          });
        }
      }
    }

    res.status(200).send("ok");

  } catch (error) {
    console.log(error);
    res.status(500).send("error");
  }
}
