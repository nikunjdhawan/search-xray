import { NextResponse } from 'next/server';

// Mock data generator for engine details
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
  const data = generateEngineDetails(params.searchId);
  return NextResponse.json(data);
}