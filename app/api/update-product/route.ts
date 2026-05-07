import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const { id, images } = await req.json();

    if (!id || !images || !Array.isArray(images)) {
      return Response.json({ success: false, error: "Invalid payload" }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), "data", "products.json");
    const fileData = fs.readFileSync(filePath, "utf-8");
    const products = JSON.parse(fileData);

    const productIndex = products.findIndex((p: any) => p.id === id);
    if (productIndex === -1) {
      return Response.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    const cleanedImages = images
      .filter(
        (img: any) =>
          img &&
          typeof img === "string" &&
          img.trim() !== "" &&
          !img.includes("placeholder")
      )
      .map((img: string) => img.trim());

    const uniqueImages = Array.from(new Set(cleanedImages));

    products[productIndex].images = uniqueImages.slice(0, 4);

    // Safely write the updated products array
    fs.writeFileSync(filePath, JSON.stringify(products, null, 2), "utf-8");

    return Response.json({ success: true, product: products[productIndex] });
  } catch (error: any) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
