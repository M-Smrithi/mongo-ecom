import { GoogleGenerativeAI } from "@google/generative-ai";
import connectDB from "@/lib/db";
import Product from "@/models/Product";

const apiKey = process.env.GEMINIAI_KEY || process.env.GEMINI_API_KEY || process.env.GEMINI_AI_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function GET() {
  return Response.json({
    success: true,
    message: "AI Search API is working",
  });
}

export async function POST(request) {
  try {
    const { query } = await request.json();

    if (!genAI) {
      return Response.json(
        {
          success: false,
          message: "Missing Gemini API key. Add GEMINIAI_KEY or GEMINI_API_KEY in Vercel env vars.",
        },
        { status: 500 }
      );
    }

    await connectDB();

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const aiRes = await model.generateContent(
      `Convert this shopping request into a short product keyword: ${query}`
    );

    const keyword = aiRes.response.text().trim();

    const products = await Product.find({
      $or: [
        { title: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
        { category: { $regex: keyword, $options: "i" } },
      ],
    }).limit(4);

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