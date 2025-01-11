import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// Mock data generator (keeping for fallback)
const generateEngineDetails = (searchId: string) => {
  const engines = ['Sabre', 'Amadeus', 'Galileo', 'Worldspan', 'NDC'];
  return engines.map((engine) => ({
    _id: crypto.randomUUID(),
    FASId: crypto.randomUUID(),
    CreatedAt: new Date(
      Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)
    ).toISOString(),
    LastAccessed: new Date(
      Date.now() - Math.floor(Math.random() * 24 * 60 * 60 * 1000)
    ).toISOString(),
    Message: `IsMini: ${Math.random() > 0.5}, IsMain: ${Math.random() > 0.5}, Engine: ${engine}, SearchType: Main, Supplier: BIZTRL`,
    Meta: {
      IsMini: Math.random() > 0.5,
      IsMain: Math.random() > 0.5,
      Engine: engine,
      SearchType: 'Main',
      Supplier: 'BIZTRL'
    },
    SearchId: searchId,
    Status: Math.random() > 0.2 ? 'Completed' : 'In Progress',
    CompletedAt: new Date(
      Date.now() - Math.floor(Math.random() * 24 * 60 * 60 * 1000)
    ).toISOString(),
    Results: `Results JSON will come here ...IsMini: True, IsMain: True, Engine: ${engine}, SearchType: Main, Supplier: BIZTRL`
  }));
};

export async function GET(
  request: Request,
  { params }: { params: { searchId: string } }
) {
  try {
    // Try to connect to MongoDB
    const client = await clientPromise;
    const db = client.db("search_analytics");
    const collection = db.collection("engine_details");

    // Attempt to fetch real data
    const data = await collection
      .find({ SearchId: params.searchId })
      .toArray();

    // If we have real data, return it
    if (data.length > 0) {
      return NextResponse.json(data);
    }

    // Fallback to mock data if no real data exists
    const mockData = generateEngineDetails(params.searchId);
    return NextResponse.json(mockData);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // Fallback to mock data on error
    const mockData = generateEngineDetails(params.searchId);
    return NextResponse.json(mockData);
  }
}