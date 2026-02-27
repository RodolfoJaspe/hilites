import { NextRequest, NextResponse } from 'next/server';

// In-memory cache for highlights (same as backend)
const highlightsCache = new Map();
const processingErrors = new Map();

// GET /api/ai-discovery/status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const matchId = searchParams.get('matchId');

  if (!matchId) {
    return NextResponse.json(
      { error: 'matchId is required' },
      { status: 400 }
    );
  }

  try {
    const highlights = highlightsCache.get(matchId) || [];
    const error = processingErrors.get(matchId);
    const isProcessing = !highlights.length && !error;

    return NextResponse.json({
      success: true,
      data: {
        matchId,
        highlights,
        isProcessing,
        error,
        hasHighlights: highlights.length > 0,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// POST /api/ai-discovery/process
export async function POST(request: NextRequest) {
  try {
    const { matchId } = await request.json();

    if (!matchId) {
      return NextResponse.json(
        { error: 'matchId is required' },
        { status: 400 }
      );
    }

    console.log('🤖 AI video discovery process triggered for match:', matchId);
    
    // Clear any previous errors
    processingErrors.delete(matchId);
    
    // For now, create a mock highlight to test the UI
    // In production, this would use the AI video discovery service
    const mockHighlights = [
      {
        id: `${matchId}-mock-1`,
        title: `Match Highlights - ${new Date().toLocaleDateString()}`,
        description: 'All goals and key moments from the match',
        youtube_url: null,
        thumbnail_url: null,
        channel_name: 'Sports Highlights',
        view_count: Math.floor(Math.random() * 500000) + 100000,
        duration_seconds: Math.floor(Math.random() * 300) + 180,
        relevance_score: 0.95,
        published_at: new Date().toISOString(),
        placeholder: true,
      }
    ];
    
    // Store highlights in cache
    highlightsCache.set(matchId, mockHighlights);
    
    const response = {
      success: true,
      data: {
        match: { id: matchId },
        highlights: mockHighlights,
        discovered_at: new Date().toISOString(),
      },
    };
    
    console.log(`✅ Successfully processed highlights for match ${matchId}`);
    return NextResponse.json(response);

  } catch (error: any) {
    console.error('❌ Error processing AI discovery:', error);
    
    const { matchId } = await request.json().catch(() => ({ matchId: 'unknown' }));
    processingErrors.set(matchId, error.message);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to process highlights',
        data: null,
      },
      { status: 500 }
    );
  }
}
