import mercadopago from "mercadopago";
import { db } from "../../lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

export default async function handler(req, res) {
  try {
    const payment = req.body;

    if (payment.type === "payment") {
      const paymentData = await mercadopago.payment.findById(payment.data.id);

      if (paymentData.body.status === "approved") {
        const productoId = paymentData.body.metadata.productoId;

        if (productoId) {
          await updateDoc(doc(db, "productos", productoId), {
            destacado: true,
          });
        }
      }
    }

    res.status(200).send("ok");

  } catch (error) {
    res.status(500).send("error");
  }
}
