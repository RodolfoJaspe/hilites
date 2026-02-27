'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useMatches } from '@/hooks/useMatches';
import { DateNavigation } from './DateNavigation';
import { MatchCard } from './MatchCard';
import { Match } from '@/types/match';

export const Home: React.FC = () => {
  const { matches, loading, error, fetchMatches } = useMatches();
  const [selectedDate, setSelectedDate] = useState<string>('today');
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);

  // Convert date navigation value to actual date for API
  const getDateForAPI = (dateValue: string): string => {
    // Get current date in Eastern Time properly
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    const parts = formatter.formatToParts(now);
    const year = parseInt(parts.find(p => p.type === 'year')!.value);
    const month = parseInt(parts.find(p => p.type === 'month')!.value) - 1;
    const day = parseInt(parts.find(p => p.type === 'day')!.value);
    const today = new Date(year, month, day);
    
    if (dateValue === 'today') {
      return today.toISOString().split('T')[0];
    } else if (dateValue.startsWith('day-')) {
      const dayIndex = parseInt(dateValue.split('-')[1]);
      const date = new Date(today);
      date.setDate(today.getDate() - dayIndex);
      return date.toISOString().split('T')[0];
    }
    return today.toISOString().split('T')[0];
  };

  // Fetch matches when selected date changes
  useEffect(() => {
    const targetDate = getDateForAPI(selectedDate);
    console.log(`Fetching matches for date: ${targetDate} (selectedDate: ${selectedDate})`);
    fetchMatches({
      date_from: targetDate,
      date_to: targetDate,
    });
  }, [selectedDate, fetchMatches]);

  // Filter matches for selected date
  const filteredMatches = useMemo(() => {
    if (!matches.length) return [];
    
    const targetDate = getDateForAPI(selectedDate);
    console.log(`Filtering ${matches.length} matches for target date: ${targetDate}`);
    
    const filtered = matches.filter((match: Match) => {
      // Convert UTC match date to Eastern Time date for comparison
      const utcDate = new Date(match.match_date);
      const easternDate = new Date(utcDate.toLocaleString('en-US', { timeZone: 'America/New_York' }));
      const matchDate = easternDate.toISOString().split('T')[0];
      
      const isMatch = matchDate === targetDate;
      if (isMatch) {
        console.log(`Match found: ${match.home_team.name} vs ${match.away_team.name} - UTC: ${match.match_date} -> Eastern: ${matchDate}`);
      }
      return isMatch;
    });
    
    console.log(`Filtered to ${filtered.length} matches`);
    return filtered;
  }, [matches, selectedDate]);

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
  };

  const handleToggleMatch = (matchId: string) => {
    setExpandedMatchId(expandedMatchId === matchId ? null : matchId);
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <div className="loading-spinner"></div>
            <p className="mt-4 text-gray-400">Loading matches...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-red-900 border border-red-700 rounded-lg p-4">
            <p className="text-red-200">Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Hilites</h1>
          <p className="text-gray-400">Football Match Highlights</p>
        </header>

        <DateNavigation
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
        />

        <main>
          {filteredMatches.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">
                No matches found for {new Date(getDateForAPI(selectedDate)).toLocaleDateString()}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMatches.map((match: Match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  isExpanded={expandedMatchId === match.id}
                  onToggle={() => handleToggleMatch(match.id)}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
