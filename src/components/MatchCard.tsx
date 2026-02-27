'use client';

import React, { useState } from 'react';
import { Match, Highlight } from '@/types/match';
import { youtubeApi } from '@/lib/api';

interface MatchCardProps {
  match: Match;
  isExpanded: boolean;
  onToggle: () => void;
}

interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
  viewCount: number;
  url: string;
  embedUrl: string;
}

export const MatchCard: React.FC<MatchCardProps> = ({
  match,
  isExpanded,
  onToggle,
}) => {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [hasHighlights, setHasHighlights] = useState(false);
  const [discovering, setDiscovering] = useState(false);
  const [discoveryError, setDiscoveryError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  const getCompetitionDisplayName = (competitionName: string) => {
    const displayNames: { [key: string]: string } = {
      'Primera Division': 'La Liga',
      'UEFA Champions League': 'Champions League',
      'Bundesliga': 'Bundesliga',
      'Serie A': 'Serie A',
      'Ligue 1': 'Ligue 1',
    };
    return displayNames[competitionName] || competitionName;
  };

  const handleDiscoverHighlights = async () => {
    setDiscovering(true);
    setDiscoveryError(null);
    
    try {
      console.log(`Searching YouTube for: ${match.home_team.name} vs ${match.away_team.name}`);
      
      const response = await youtubeApi.searchVideos({
        home_team: match.home_team.name,
        away_team: match.away_team.name,
        match_date: match.match_date,
      });

      if (response.success && response.data) {
        const videos: YouTubeVideo[] = response.data;
        
        // Convert YouTube videos to Highlight format
        const videoHighlights: Highlight[] = videos.map((video: YouTubeVideo) => ({
          id: video.id,
          title: video.title,
          description: video.description,
          youtube_url: video.url,
          thumbnail_url: video.thumbnail,
          channel_name: video.channelTitle,
          view_count: video.viewCount,
          duration_seconds: 0,
          relevance_score: 0.9,
          published_at: video.publishedAt,
          placeholder: false,
          embedUrl: video.embedUrl,
        }));
        
        console.log(`Found ${videoHighlights.length} videos`);
        setHighlights(videoHighlights);
        setHasHighlights(videoHighlights.length > 0);
        
        if (videoHighlights.length === 0) {
          setDiscoveryError('No highlights found for this match');
        }
      } else {
        setDiscoveryError(response.error || 'Failed to find highlights');
      }
    } catch (error: any) {
      console.error('Error discovering highlights:', error);
      setDiscoveryError(error.message || 'Failed to discover highlights');
    } finally {
      setDiscovering(false);
    }
  };

  const handlePlayVideo = (highlight: Highlight) => {
    if (highlight.embedUrl) {
      setSelectedVideo(highlight.embedUrl);
    }
  };

  const handleCloseVideo = () => {
    setSelectedVideo(null);
  };

  // Format view count to readable format
  const formatViewCount = (views: number): string => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M views`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(0)}K views`;
    }
    return `${views} views`;
  };

  // Format upload date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  return (
    <div className={`match-card ${isExpanded ? 'expanded' : ''}`} onClick={onToggle}>
      {/* Collapsed State */}
      {!isExpanded && (
        <div>
          <div className="match-competition">
            {getCompetitionDisplayName(match.competition_name)}
          </div>
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <span className="font-semibold">{match.home_team.name}</span>
            </div>
            <span className="mx-4 text-gray-500">vs</span>
            <div className="flex-1 text-right">
              <span className="font-semibold">{match.away_team.name}</span>
            </div>
          </div>
        </div>
      )}

      {/* Expanded State */}
      {isExpanded && (
        <div>
          <div className="match-competition">
            {getCompetitionDisplayName(match.competition_name)}
          </div>
          
          <div className="match-teams-expanded">
            <div className="flex-1">
              <span className="team-name-large">{match.home_team.name}</span>
            </div>
            <span className="vs-text-large">vs</span>
            <div className="flex-1 text-right">
              <span className="team-name-large">{match.away_team.name}</span>
            </div>
          </div>

          {/* Video Section */}
          <div className="video-section">
            {/* Inline Video Player */}
            {selectedVideo && (
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold">Video Player</h4>
                  <button
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      handleCloseVideo();
                    }}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    ✕ Close
                  </button>
                </div>
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    src={selectedVideo}
                    className="absolute top-0 left-0 w-full h-full rounded-lg"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

              {discovering && !hasHighlights && !selectedVideo && (
                <div className="text-center py-4">
                  <div className="loading-spinner"></div>
                  <p className="mt-2">🤖 Finding highlights...</p>
                </div>
              )}

              {discoveryError && (
                <div className="bg-red-900 border border-red-700 rounded-lg p-4 mb-4">
                  <p className="text-red-200">⚠️ {discoveryError}</p>
                </div>
              )}

              {hasHighlights && highlights.length > 0 && !selectedVideo && (
                <div className="video-thumbnail-container">
                  {highlights.map((highlight: Highlight, index: number) => (
                    <div key={highlight.id || index} className="video-item">
                      <div
                        className={`video-thumbnail ${!highlight.embedUrl ? 'not-clickable' : ''}`}
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          if (highlight.embedUrl) {
                            handlePlayVideo(highlight);
                          }
                        }}
                      >
                        {highlight.thumbnail_url ? (
                          <img
                            src={highlight.thumbnail_url}
                            alt={highlight.title}
                            className="w-full h-48 object-cover"
                          />
                        ) : (
                          <div className="thumbnail-placeholder">
                            {highlight.placeholder ? (
                              <div className="placeholder-content">
                                <div className="text-4xl mb-2">🎥</div>
                                <p className="font-semibold">Highlights Found!</p>
                                <p className="text-sm text-gray-600">AI Discovery Demo Mode</p>
                                <p className="text-xs text-gray-500 mt-1">No actual video in demo</p>
                              </div>
                            ) : (
                              <div className="text-4xl">🎥</div>
                            )}
                          </div>
                        )}
                        <div className="play-overlay">
                          {highlight.embedUrl && (
                            <div className="play-button-overlay">▶️</div>
                          )}
                        </div>
                        <div className="video-title-overlay">
                          <h5 className="font-semibold">{highlight.title}</h5>
                          <span>📺 {highlight.channel_name}</span>
                        </div>
                      </div>
                      {/* Video Info Section */}
                      <div className="video-info-overlay">
                        <div className="flex justify-between items-center text-xs text-gray-300">
                          <span>{highlight.view_count ? formatViewCount(highlight.view_count) : 'No views'}</span>
                          <span>{formatDate(highlight.published_at)}</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {highlight.channel_name}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!hasHighlights && !discovering && !discoveryError && !selectedVideo && (
                <div className="text-center py-4">
                  <p className="text-gray-400 mb-4">No highlights found for this match.</p>
                  <button
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      handleDiscoverHighlights();
                    }}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    🤖 Discover Highlights
                  </button>
                </div>
              )}
            </div>
        </div>
      )}
    </div>
  );
};
