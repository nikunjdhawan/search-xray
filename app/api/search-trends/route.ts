import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { subHours } from 'date-fns';

// Mock data generator for fallback
const generateMockTrends = () => {
  const now = new Date();
  const data = [];
  
  // Generate data points for the last 60 minutes
  for (let i = 59; i >= 0; i--) {
    const timestamp = subHours(now, 1).getTime() + (i * 60000); // Add i minutes
    data.push({
      timestamp,
      searches: Math.floor(Math.random() * 10) + 1 // 1-10 searches per minute
    });
  }
  
  return data;
};

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("search_analytics");
    const collection = db.collection("search_logs");

    // Get searches from the last hour
    const oneHourAgo = subHours(new Date(), 1);

    // Aggregate searches per minute
    const searchTrends = await collection.aggregate([
      {
        $match: {
          CreatedAt: { $gte: oneHourAgo.toISOString() }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: { $dateFromString: { dateString: "$CreatedAt" } } },
            month: { $month: { $dateFromString: { dateString: "$CreatedAt" } } },
            day: { $dayOfMonth: { $dateFromString: { dateString: "$CreatedAt" } } },
            hour: { $hour: { $dateFromString: { dateString: "$CreatedAt" } } },
            minute: { $minute: { $dateFromString: { dateString: "$CreatedAt" } } }
          },
          searches: { $sum: 1 },
          timestamp: { $first: { $dateFromString: { dateString: "$CreatedAt" } } }
        }
      },
      {
        $project: {
          _id: 0,
          timestamp: "$timestamp",
          searches: 1
        }
      },
      {
        $sort: { timestamp: 1 }
      }
    ]).toArray();

    // If we have real data, return it
    if (searchTrends.length > 0) {
      return NextResponse.json(searchTrends);
    }

    // Fallback to mock data if no real data exists
    return NextResponse.json(generateMockTrends());
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // Fallback to mock data on error
    return NextResponse.json(generateMockTrends());
  }
}