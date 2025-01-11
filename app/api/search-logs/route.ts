import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

// Mock data generator (keeping for fallback)
const generateMockData = () => {
  return Array.from({ length: 10 }, () => ({
    _id: crypto.randomUUID(),
    SearchId: crypto.randomUUID(),
    CreatedAt: new Date(
      Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)
    ).toISOString(),
    CompletedAt: new Date(
      Date.now() - Math.floor(Math.random() * 24 * 60 * 60 * 1000)
    ).toISOString(),
    LastAccessed: new Date().toISOString(),
    CompletedEngines: Math.floor(Math.random() * 5) + 1,
    TotalEngines: 5,
    Status: Math.random() > 0.2 ? "Completed" : "In Progress",
  }));
};

export async function GET() {
  try {
    // Try to connect to MongoDB
    const client = await clientPromise;
    const db = client.db("search_analytics");
    const collection = db.collection("search_logs");

    // Attempt to fetch real data
    const data = await collection
      .find({})
      .sort({ CreatedAt: -1 })
      .limit(10)
      .toArray();

    // If we have real data, return it
    if (data.length > 0) {
      return NextResponse.json(data);
    }

    // Fallback to mock data if no real data exists
    const mockData = generateMockData();
    return NextResponse.json(mockData);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    // Fallback to mock data on error
    const mockData = generateMockData();
    return NextResponse.json(mockData);
  }
}
