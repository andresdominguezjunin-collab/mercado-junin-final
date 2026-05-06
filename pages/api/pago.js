import mercadopago from "mercadopago";

mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN,
});

export default async function handler(req, res) {
  const { productoId } = req.body;

  try {
    const preference = {
      items: [
        {
          title: "Destacar producto",
          quantity: 1,
          currency_id: "ARS",
          unit_price: 1000,
        },
      ],
      metadata: {
        productoId: productoId,
      },
      notification_url: "https://TU-APP.vercel.app/api/webhook",
      back_urls: {
        success: "https://TU-APP.vercel.app",
        failure: "https://TU-APP.vercel.app",
      },
      auto_return: "approved",
    };

    const response = await mercadopago.preferences.create(preference);

    res.status(200).json({ id: response.body.id });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
