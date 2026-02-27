import { NextRequest, NextResponse } from 'next/server';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const homeTeam = searchParams.get('home_team');
    const awayTeam = searchParams.get('away_team');
    const matchDate = searchParams.get('match_date');

    if (!homeTeam || !awayTeam) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    if (!YOUTUBE_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'YouTube API key not configured' },
        { status: 500 }
      );
    }

    // Build search query for match highlights
    const searchQuery = `${homeTeam} ${awayTeam} highlights ${new Date().getFullYear()}`;
    
    console.log(`Searching YouTube for: ${searchQuery}`);

    const url = `${YOUTUBE_API_BASE_URL}/search?` + new URLSearchParams({
      part: 'snippet',
      q: searchQuery,
      type: 'video',
      maxResults: '5',
      order: 'date',
      key: YOUTUBE_API_KEY,
      videoDuration: 'medium', // Filter for medium length videos (4-20 min)
      videoEmbeddable: 'true', // Only embeddable videos
    });

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Get video IDs to fetch view counts
    const videoIds = data.items?.map((item: any) => item.id.videoId).join(',');
    
    // Fetch video statistics (view counts)
    const statsUrl = `${YOUTUBE_API_BASE_URL}/videos?` + new URLSearchParams({
      part: 'statistics',
      id: videoIds,
      key: YOUTUBE_API_KEY,
    });
    
    const statsResponse = await fetch(statsUrl);
    const statsData = await statsResponse.json();
    
    // Create a map of video ID to view count
    const viewCountMap = new Map();
    statsData.items?.forEach((item: any) => {
      viewCountMap.set(item.id, parseInt(item.statistics.viewCount) || 0);
    });

    // Transform YouTube results
    const videos = data.items?.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.medium.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      viewCount: viewCountMap.get(item.id.videoId) || 0,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      embedUrl: `https://www.youtube.com/embed/${item.id.videoId}`,
    })) || [];

    console.log(`Found ${videos.length} videos for ${searchQuery}`);

    return NextResponse.json({
      success: true,
      data: videos,
      query: searchQuery,
    });

  } catch (error: any) {
    console.error('Error searching YouTube:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to search YouTube' },
      { status: 500 }
    );
  }
}
