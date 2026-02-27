import { NextRequest, NextResponse } from 'next/server';

// In-memory cache (shared with other AI discovery routes)
const highlightsCache = new Map();
const processingErrors = new Map();

// DELETE /api/ai-discovery/clear/[matchId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { matchId: string } }
) {
  try {
    const { matchId } = params;
    
    // Clear highlights and errors for this match
    highlightsCache.delete(matchId);
    processingErrors.delete(matchId);
    
    console.log(`🗑️ Cleared highlights cache for match: ${matchId}`);
    
    return NextResponse.json({
      success: true,
      message: 'Highlights cache cleared successfully',
      matchId,
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
