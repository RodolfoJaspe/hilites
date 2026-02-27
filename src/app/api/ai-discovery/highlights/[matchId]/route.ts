import { NextRequest, NextResponse } from 'next/server';

// In-memory cache (shared with other AI discovery routes)
const highlightsCache = new Map();

// GET /api/ai-discovery/highlights/[matchId]
export async function GET(
  request: NextRequest,
  { params }: { params: { matchId: string } }
) {
  try {
    const { matchId } = params;
    const highlights = highlightsCache.get(matchId) || [];

    return NextResponse.json({
      success: true,
      data: {
        matchId,
        highlights,
        count: highlights.length,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        data: null,
      },
      { status: 500 }
    );
  }
}
