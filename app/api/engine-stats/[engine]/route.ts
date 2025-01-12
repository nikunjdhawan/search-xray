import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// Mock data generator for fallback
const generateMockEngineDetail = (engineName: string) => {
  return {
    engine: engineName,
    totalSearches: Math.floor(Math.random() * 1000) + 100,
    completedSearches: Math.floor(Math.random() * 800) + 100,
    averageResponseTime: Math.random() * 30 + 10,
    successRate: Math.random() * 20 + 80,
    mainSearches: Math.floor(Math.random() * 400) + 50,
    nearbySearches: Math.floor(Math.random() * 300) + 30,
    alternateSearches: Math.floor(Math.random() * 200) + 20,
    hourlyStats: Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      searches: Math.floor(Math.random() * 50) + 10,
      successRate: Math.random() * 20 + 80,
      avgResponseTime: Math.random() * 30 + 10
    })),
    recentSearches: Array.from({ length: 10 }, () => ({
      id: crypto.randomUUID(),
      timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      type: ['Main', 'Nearby', 'Alternate'][Math.floor(Math.random() * 3)],
      status: Math.random() > 0.2 ? 'Completed' : 'In Progress',
      responseTime: Math.random() * 30 + 10
    }))
  };
};

export async function GET(
  request: Request,
  { params }: { params: { engine: string } }
) {
  const engineName = decodeURIComponent(params.engine);
  
  try {
    return NextResponse.json(generateMockEngineDetail(engineName));
    const client = await clientPromise;
    const db = client.db("search_analytics");
    const collection = db.collection("engine_details");

    // Get basic stats
    const basicStats = await collection.aggregate([
      {
        $match: { "Meta.Engine": engineName }
      },
      {
        $group: {
          _id: null,
          totalSearches: { $sum: 1 },
          completedSearches: { $sum: { $cond: [{ $eq: ["$Status", "Completed"] }, 1, 0] } },
          mainSearches: { $sum: { $cond: [{ $eq: ["$Meta.SearchType", "Main"] }, 1, 0] } },
          nearbySearches: { $sum: { $cond: [{ $eq: ["$Meta.SearchType", "Nearby"] }, 1, 0] } },
          alternateSearches: { $sum: { $cond: [{ $eq: ["$Meta.SearchType", "Alternate"] }, 1, 0] } },
          totalResponseTime: {
            $sum: {
              $cond: [
                { $eq: ["$Status", "Completed"] },
                { $divide: [{ $subtract: ["$CompletedAt", "$CreatedAt"] }, 1000] },
                0
              ]
            }
          }
        }
      }
    ]).toArray();

    // Get hourly stats for the last 24 hours
    const hourlyStats = await collection.aggregate([
      {
        $match: {
          "Meta.Engine": engineName,
          CreatedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: { $hour: "$CreatedAt" },
          searches: { $sum: 1 },
          successCount: { $sum: { $cond: [{ $eq: ["$Status", "Completed"] }, 1, 0] } },
          totalResponseTime: {
            $sum: {
              $cond: [
                { $eq: ["$Status", "Completed"] },
                { $divide: [{ $subtract: ["$CompletedAt", "$CreatedAt"] }, 1000] },
                0
              ]
            }
          }
        }
      },
      {
        $project: {
          hour: "$_id",
          searches: 1,
          successRate: {
            $multiply: [
              { $divide: ["$successCount", "$searches"] },
              100
            ]
          },
          avgResponseTime: {
            $cond: [
              { $gt: ["$successCount", 0] },
              { $divide: ["$totalResponseTime", "$successCount"] },
              0
            ]
          }
        }
      },
      { $sort: { hour: 1 } }
    ]).toArray();

    // Get recent searches
    const recentSearches = await collection.find(
      { "Meta.Engine": engineName },
      {
        sort: { CreatedAt: -1 },
        limit: 10,
        projection: {
          _id: 1,
          CreatedAt: 1,
          Status: 1,
          "Meta.SearchType": 1,
          CompletedAt: 1
        }
      }
    ).toArray();

    if (basicStats.length > 0) {
      const stats = basicStats[0];
      return NextResponse.json({
        engine: engineName,
        totalSearches: stats.totalSearches,
        completedSearches: stats.completedSearches,
        averageResponseTime: stats.totalResponseTime / stats.completedSearches,
        successRate: (stats.completedSearches / stats.totalSearches) * 100,
        mainSearches: stats.mainSearches,
        nearbySearches: stats.nearbySearches,
        alternateSearches: stats.alternateSearches,
        hourlyStats,
        recentSearches: recentSearches.map(search => ({
          id: search._id,
          timestamp: search.CreatedAt,
          type: search.Meta.SearchType,
          status: search.Status,
          responseTime: search.CompletedAt 
            ? (new Date(search.CompletedAt).getTime() - new Date(search.CreatedAt).getTime()) / 1000
            : null
        }))
      });
    }

    return NextResponse.json(generateMockEngineDetail(engineName));
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return NextResponse.json(generateMockEngineDetail(engineName));
  }
}