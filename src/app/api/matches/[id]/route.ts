import { NextRequest, NextResponse } from 'next/server';

// Football Data API configuration
const FOOTBALL_API_BASE_URL = 'https://api.football-data.org/v4';
const FOOTBALL_API_KEY = process.env.FOOTBALL_DATA_API_KEY || 'YOUR_API_KEY_HERE';

// Helper function to transform match data
function transformMatch(match: any) {
  return {
    id: match.id.toString(),
    external_id: match.id.toString(),
    competition_name: match.competition?.name || 'Unknown Competition',
    competition_id: match.competition?.id?.toString(),
    match_date: match.utcDate || new Date().toISOString(),
    status: match.status || 'unknown',
    home_score: match.score?.fullTime?.home,
    away_score: match.score?.fullTime?.away,
    home_team: {
      id: match.homeTeam?.id,
      name: match.homeTeam?.name || 'Unknown Team',
      short_name: match.homeTeam?.shortName || match.homeTeam?.name,
      logo_url: match.homeTeam?.crest,
    },
    away_team: {
      id: match.awayTeam?.id,
      name: match.awayTeam?.name || 'Unknown Team',
      short_name: match.awayTeam?.shortName || match.awayTeam?.name,
      logo_url: match.awayTeam?.crest,
    },
  };
}

// GET /api/matches/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    console.log(`Fetching match details for ID: ${id}`);
    
    const url = `${FOOTBALL_API_BASE_URL}/matches/${id}`;
    const response = await fetch(url, {
      headers: {
        'X-Auth-Token': FOOTBALL_API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`Football Data API error: ${response.status} ${response.statusText}`);
    }

    const matchData = await response.json();
    const transformedMatch = transformMatch(matchData);

    return NextResponse.json({
      success: true,
      data: transformedMatch,
    });

  } catch (error: any) {
    console.error(`Error fetching match:`, error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch match',
        data: null,
      },
      { status: 500 }
    );
  }
}
