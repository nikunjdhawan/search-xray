import { NextResponse } from 'next/server';

// Mock data generator
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
    Status: Math.random() > 0.2 ? 'Completed' : 'In Progress',
  }));
};

export async function GET() {
  const data = generateMockData();
  return NextResponse.json(data);
}