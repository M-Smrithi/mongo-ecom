import connectDB from "@/lib/db";
import Product from "@/models/Product";

export const runtime = "nodejs";

const fallbackProducts = [
  {
    title: "Blue Shirt",
    description: "Comfortable cotton blue shirt",
    price: 999,
    category: "Clothing",
    image: "https://picsum.photos/500/300",
    stock: 20,
  },
  {
    title: "Black T-Shirt",
    description: "Premium black t-shirt for everyday wear",
    price: 699,
    category: "Clothing",
    image: "https://picsum.photos/500/300",
    stock: 30,
  },
  {
    title: "Running Shoes",
    description: "Lightweight running shoes",
    price: 2499,
    category: "Footwear",
    image: "https://picsum.photos/500/300",
    stock: 12,
  },
  {
    title: "Wireless Headphones",
    description: "Noise cancelling headphones",
    price: 4999,
    category: "Electronics",
    image: "https://picsum.photos/500/300",
    stock: 8,
  },
  {
    title: "Laptop Backpack",
    description: "Water resistant backpack",
    price: 1599,
    category: "Bags",
    image: "https://picsum.photos/500/300",
    stock: 20,
  },
  {
    title: "Mechanical Keyboard",
    description: "High performance keyboard",
    price: 3999,
    category: "Electronics",
    image: "https://picsum.photos/500/300",
    stock: 18,
  },
];

export async function GET() {
  try {
    await connectDB();

    const products = await Product.find({}).sort({ _id: -1 });

    if (products.length === 0) {
      const seededProducts = await Product.insertMany(fallbackProducts);
      return Response.json({
        success: true,
        count: seededProducts.length,
        products: seededProducts,
      });
    }

    return Response.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Products API error:", error);

    return Response.json(
      {
        success: true,
        count: fallbackProducts.length,
        products: fallbackProducts,
        warning: "Using fallback products because the database is unavailable.",
      },
      { status: 200 }
    );
  }
}