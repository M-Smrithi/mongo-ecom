import { GoogleGenerativeAI } from "@google/generative-ai";
import connectDB from "@/lib/db";
import Product from "@/models/Product";

const genAI = new GoogleGenerativeAI(
  process.env.GEMINIAI_KEY
);
export async function GET() {
  return Response.json({
    success: true,
    message: "AI Search API is working",
  });
}
export async function POST(request) {
  try {
    const { query } = await request.json();

    await connectDB();

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const aiRes = await model.generateContent(
      `Convert this shopping request into a short product keyword: ${query}`
    );

    const keyword = aiRes.response.text().trim();

    const products = await Product.find({
      title: { $regex: keyword, $options: "i" },
    });

    return Response.json({
      keyword,
      products,
    });
  } catch (error) {
    console.log(error);

    return Response.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}