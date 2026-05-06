import mercadopago from "mercadopago";

mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN,
});

export default async function handler(req, res) {
  const { tipo, productoId } = req.body;

  try {
    let preference = {};

    if (tipo === "destacar") {
      preference = {
        items: [
          {
            title: "Destacar producto",
            quantity: 1,
            currency_id: "ARS",
            unit_price: 1000,
          },
        ],
        metadata: {
          tipo: "destacar",
          productoId,
        },
        back_urls: {
          success: "https://TU-APP.vercel.app",
        },
        auto_return: "approved",
      };
    }

    if (tipo === "sponsor") {
      preference = {
        items: [
          {
            title: "Sponsor mensual",
            quantity: 1,
            currency_id: "ARS",
            unit_price: 5000,
          },
        ],
        metadata: {
          tipo: "sponsor",
        },
        back_urls: {
          success: "https://TU-APP.vercel.app/sponsor",
        },
        auto_return: "approved",
      };
    }

    const response = await mercadopago.preferences.create(preference);

    res.status(200).json({ id: response.body.id });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
