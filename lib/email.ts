import emailjs from "@emailjs/browser";

interface FormData {
  name: string;
  email: string;
  phone: string;
  notes?: string;
}

const serviceId = "service_036p77h";
const publicKey = "o1vJgnVoz5Yw8jKrH";

/* =========================
   GENERATE ORDER ROWS
========================= */
export const generateOrderRows = (cartItems: any[]) => {
  return cartItems.map((item, index) => `
    <tr style="background:${index % 2 === 0 ? "#ffffff" : "#f8fafc"};">
      <td align="center" style="padding:12px;border-bottom:1px solid #e2e8f0;">
        ${index + 1}
      </td>

      <td style="padding:12px;border-bottom:1px solid #e2e8f0;">
        <strong>${item.name}</strong>
      </td>

      <td align="center" style="padding:12px;border-bottom:1px solid #e2e8f0;">
        ${item.quantity}
      </td>

      <td align="right" style="padding:12px;border-bottom:1px solid #e2e8f0;">
        ₹${item.price.toLocaleString("en-IN")}
      </td>
    </tr>
  `).join("");
};

/* =========================
   CUSTOMER EMAIL
========================= */
export const sendCustomerEmail = async (
  formData: FormData,
  cart: any[],
  cartTotal: number
) => {
  const templateParams = {
    customer_name: formData.name,
    customer_email: formData.email,
    customer_phone: formData.phone,

    // IMPORTANT
    order_rows: generateOrderRows(cart),

    total_price: `₹${cartTotal.toLocaleString("en-IN")}`,

    order_notes: formData.notes?.trim()
      ? formData.notes
      : "No additional notes",
  };

  const templateId = "template_xf1iqgj";

  try {
    const response = await emailjs.send(
      serviceId,
      templateId,
      templateParams,
      publicKey
    );

    console.log("Customer email sent ✅");
    return response;
  } catch (error) {
    console.error("Customer Email Error ❌", error);
    throw error;
  }
};

/* =========================
   SHOP EMAIL
========================= */
export const sendShopEmail = async (
  formData: FormData,
  cart: any[],
  cartTotal: number
) => {
  const templateParams = {
    customer_name: formData.name,
    customer_email: formData.email,
    customer_phone: formData.phone,

    // IMPORTANT
    order_rows: generateOrderRows(cart),

    total_price: `₹${cartTotal.toLocaleString("en-IN")}`,

    order_notes: formData.notes?.trim()
      ? formData.notes
      : "No additional notes",

    shop_email: "electromart.cbe@gmail.com",
  };

  const templateId = "template_1p14e02";

  try {
    const response = await emailjs.send(
      serviceId,
      templateId,
      templateParams,
      publicKey
    );

    console.log("Shop email sent ✅");
    return response;
  } catch (error) {
    console.error("Shop Email Error ❌", error);
    throw error;
  }
};