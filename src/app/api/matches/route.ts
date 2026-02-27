import { NextRequest, NextResponse } from 'next/server';

// Football Data API configuration
const FOOTBALL_API_BASE_URL = 'https://api.football-data.org/v4';
const FOOTBALL_API_KEY = process.env.FOOTBALL_DATA_API_KEY || 'YOUR_API_KEY_HERE';

// Server-side cache to reduce API calls
const serverCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Default leagues to fetch
const DEFAULT_LEAGUES = [
  'PL',      // Premier League
  'PD',      // La Liga (Primera Division)
  'CL',      // Champions League
  'BL1',     // Bundesliga
  'SA',      // Serie A
  'FL1',     // Ligue 1
];

// Helper function to get cache key
function getCacheKey(params: any) {
  return JSON.stringify(params);
}

// Helper function to check if cache is valid
function isCacheValid(timestamp: number) {
  return Date.now() - timestamp < CACHE_TTL;
}

// Helper function to get local timezone date range
function getDateRange(dateStr?: string) {
  // Use current system date since Football Data API has future matches
  const currentDate = dateStr ? new Date(dateStr) : new Date();
  
  const dateFrom = currentDate.toISOString().split('T')[0];
  const dateTo = currentDate.toISOString().split('T')[0];
  
  return { dateFrom, dateTo };
}

// Helper function to fetch matches from Football Data API
async function fetchMatchesFromFootballData(params: {
  dateFrom?: string;
  dateTo?: string;
  competitions?: string;
}) {
  // Check server cache first
  const cacheKey = getCacheKey(params);
  const cached = serverCache.get(cacheKey);
  
  if (cached && isCacheValid(cached.timestamp)) {
    console.log(`Using cached data for key: ${cacheKey}`);
    return cached.data;
  }

  // If no API key, return mock data
  if (FOOTBALL_API_KEY === 'YOUR_API_KEY_HERE') {
    console.log('No Football API key provided, returning mock data');
    
    const { dateFrom, dateTo } = getDateRange(params.dateFrom);
    const startDate = new Date(dateFrom);
    const endDate = new Date(dateTo);
    const mockMatches = [];
    
    // Generate mock data for each day in the range
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const currentDate = new Date(d);
      
      // Add 1-3 matches per day
      const numMatches = Math.floor(Math.random() * 3) + 1;
      
      for (let i = 0; i < numMatches; i++) {
        const isPremierLeague = Math.random() > 0.5;
        const teams = isPremierLeague ? 
          [
            { home: 'Arsenal', away: 'Chelsea' },
            { home: 'Manchester United', away: 'Liverpool' },
            { home: 'Tottenham', away: 'Manchester City' },
            { home: 'Everton', away: 'Newcastle' }
          ] : [
            { home: 'Real Madrid', away: 'Barcelona' },
            { home: 'Atletico Madrid', away: 'Sevilla' },
            { home: 'Valencia', away: 'Real Betis' }
          ];
        
        const team = teams[Math.floor(Math.random() * teams.length)];
        const matchId = parseInt(currentDate.toISOString().split('T')[0].replace(/-/g, '')) * 100 + i;
        
        mockMatches.push({
          id: matchId,
          competition: { 
            name: isPremierLeague ? 'Premier League' : 'La Liga', 
            id: isPremierLeague ? 39 : 140 
          },
          utcDate: currentDate.toISOString(),
          status: 'finished',
          score: { 
            fullTime: { 
              home: Math.floor(Math.random() * 4), 
              away: Math.floor(Math.random() * 4) 
            } 
          },
          homeTeam: { 
            id: Math.floor(Math.random() * 1000), 
            name: team.home, 
            shortName: team.home, 
            crest: null 
          },
          awayTeam: { 
            id: Math.floor(Math.random() * 1000), 
            name: team.away, 
            shortName: team.away, 
            crest: null 
          },
        });
      }
    }
    
    const mockData = { matches: mockMatches };
    serverCache.set(cacheKey, { data: mockData, timestamp: Date.now() });
    return mockData;
  }

  const competitions = params.competitions || DEFAULT_LEAGUES.join(',');
  
  // Always fetch all matches first, then filter by date
  let url = `${FOOTBALL_API_BASE_URL}/matches?competitions=${competitions}`;
  
  // Always fetch a broader range to get more matches (never use date params in API call)
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(now.getDate() - 7);
  
  url += `&dateFrom=${weekAgo.toISOString().split('T')[0]}&dateTo=${now.toISOString().split('T')[0]}`;
  
  console.log(`Fetching matches from Football Data API: ${url}`);
  
  const response = await fetch(url, {
    headers: {
      'X-Auth-Token': FOOTBALL_API_KEY,
    },
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    throw new Error(`Football Data API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  
  // Filter matches by date if date parameters are provided
  if (params.dateFrom || params.dateTo) {
    // Use the provided dates directly for filtering
    const dateFrom = params.dateFrom;
    const dateTo = params.dateTo || params.dateFrom;
    
    data.matches = data.matches.filter((match: any) => {
      // Convert UTC match date to Eastern Time date for comparison
      const utcDate = new Date(match.utcDate);
      const easternDate = new Date(utcDate.toLocaleString('en-US', { timeZone: 'America/New_York' }));
      const matchDate = easternDate.toISOString().split('T')[0];
      
      if (dateFrom && dateTo) {
        return matchDate >= dateFrom && matchDate <= dateTo;
      } else if (dateFrom) {
        return matchDate >= dateFrom;
      } else if (dateTo) {
        return matchDate <= dateTo;
      }
      
      return true;
    });
    
    console.log(`Filtered matches for date range ${dateFrom} to ${dateTo}: ${data.matches.length} matches`);
  }
  
  // Cache the result
  serverCache.set(cacheKey, { data, timestamp: Date.now() });
  console.log(`Cached data for key: ${cacheKey}`);
  
  return data;
}

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

// GET /api/matches
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const params = {
      dateFrom: searchParams.get('date_from') || undefined,
      dateTo: searchParams.get('date_to') || undefined,
      competitions: searchParams.get('competition_id') || undefined,
      status: searchParams.get('status') || undefined,
      limit: parseInt(searchParams.get('limit') || '200'),
      offset: parseInt(searchParams.get('offset') || '0'),
    };

    console.log(`API request: GET /api/matches with params:`, params);

    // Fetch matches from Football Data API
    const footballData = await fetchMatchesFromFootballData(params);
    
    // Transform matches
    const transformedMatches = footballData.matches.map((match: any) => transformMatch(match));
    
    // Apply pagination
    const startIndex = params.offset;
    const endIndex = startIndex + params.limit;
    const paginatedMatches = transformedMatches.slice(startIndex, endIndex);

    // Apply status filter if specified (but don't filter out scheduled matches by default)
    const filteredMatches = params.status && params.status !== 'all'
      ? paginatedMatches.filter(match => match.status === params.status)
      : paginatedMatches;

    const response = {
      success: true,
      data: filteredMatches,
      pagination: {
        total: transformedMatches.length,
        limit: params.limit,
        offset: params.offset,
        has_more: endIndex < transformedMatches.length,
      },
      filters: {
        date_from: params.dateFrom,
        date_to: params.dateTo,
        competition_id: params.competitions,
        status: params.status,
      },
    };

    console.log(`Returning ${filteredMatches.length} matches`);
    return NextResponse.json(response);

  } catch (error: any) {
    console.error('Error in GET /api/matches:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch matches',
        data: [],
      },
      { status: 500 }
    );
  }
}

// GET /api/matches/[id]
export async function getMatchById(id: string) {
  try {
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
    console.error(`Error fetching match ${id}:`, error);
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
