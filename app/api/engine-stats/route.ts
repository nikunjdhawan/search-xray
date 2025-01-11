import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// Mock stats generator for fallback
const generateMockEngineStats = () => {
  const engines = ['Sabre', 'Amadeus', 'Galileo', 'Worldspan', 'NDC'];
  return engines.map(engine => ({
    engine,
    totalSearches: Math.floor(Math.random() * 1000) + 100,
    completedSearches: Math.floor(Math.random() * 800) + 100,
    averageResponseTime: Math.random() * 30 + 10,
    successRate: Math.random() * 20 + 80,
    mainSearches: Math.floor(Math.random() * 400) + 50,
    nearbySearches: Math.floor(Math.random() * 300) + 30,
    alternateSearches: Math.floor(Math.random() * 200) + 20
  }));
};

export async function GET() {
      return NextResponse.json(generateMockEngineStats());

  try {
    const client = await clientPromise;
    const db = client.db("search_analytics");
    const collection = db.collection("engine_details");

    const engineStats = await collection.aggregate([
      {
        $group: {
          _id: "$Meta.Engine",
          totalSearches: { $sum: 1 },
          completedSearches: {
            $sum: { $cond: [{ $eq: ["$Status", "Completed"] }, 1, 0] }
          },
          totalResponseTime: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ["$Status", "Completed"] },
                  { $ne: ["$CompletedAt", null] }
                ]},
                {
                  $divide: [
                    { $subtract: [
                      "$CompletedAt",
                      "$CreatedAt"
                    ]},
                    1000 // Convert to seconds
                  ]
                },
                0
              ]
            }
          },
          mainSearches: {
            $sum: { $cond: [{ $eq: ["$Meta.SearchType", "Main"] }, 1, 0] }
          },
          nearbySearches: {
            $sum: { $cond: [{ $eq: ["$Meta.SearchType", "Nearby"] }, 1, 0] }
          },
          alternateSearches: {
            $sum: { $cond: [{ $eq: ["$Meta.SearchType", "Alternate"] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          _id: 0,
          engine: "$_id",
          totalSearches: 1,
          completedSearches: 1,
          averageResponseTime: {
            $cond: [
              { $gt: ["$completedSearches", 0] },
              { $divide: ["$totalResponseTime", "$completedSearches"] },
              0
            ]
          },
          successRate: {
            $multiply: [
              { $divide: ["$completedSearches", { $max: ["$totalSearches", 1] }] },
              100
            ]
          },
          mainSearches: 1,
          nearbySearches: 1,
          alternateSearches: 1
        }
      },
      { $sort: { totalSearches: -1 } }
    ]).toArray();

    if (engineStats.length > 0) {
      return NextResponse.json(engineStats);
    }

    return NextResponse.json(generateMockEngineStats());
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return NextResponse.json(generateMockEngineStats());
  }
}