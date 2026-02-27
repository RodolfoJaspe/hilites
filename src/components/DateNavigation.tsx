'use client';

import React, { useEffect, useRef } from 'react';

interface DateOption {
  value: string;
  label: string;
  date: Date;
  formattedDate: string;
  dayIndex: number;
}

interface DateNavigationProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export const DateNavigation: React.FC<DateNavigationProps> = ({
  selectedDate,
  onDateChange,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Generate date options for the past 30 days
  const getDateOptions = (): DateOption[] => {
    const dates: DateOption[] = [];
    
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
    
    console.log('DateNavigation: Today (Eastern):', today.toISOString().split('T')[0]);
    
    // Generate dates for the past 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      const formattedDate = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
      
      let label;
      if (i === 0) {
        label = 'Today';
      } else if (i === 1) {
        label = 'Yesterday';
      } else {
        label = formattedDate;
      }
      
      // Log the first few dates for debugging
      if (i <= 6 || i >= 28) {
        console.log(`DateNavigation: Day-${i} -> ${date.toISOString().split('T')[0]} (${label})`);
      }
      
      dates.push({
        value: i === 0 ? 'today' : `day-${i}`,
        label: label,
        date: date,
        formattedDate: formattedDate,
        dayIndex: i
      });
    }
    
    return dates;
  };

  const dateOptions = getDateOptions();

  // Scroll to selected date when it changes
  useEffect(() => {
    if (scrollContainerRef.current && selectedDate) {
      const selectedIndex = dateOptions.findIndex(option => option.value === selectedDate);
      if (selectedIndex !== -1) {
        const selectedElement = scrollContainerRef.current.children[selectedIndex] as HTMLElement;
        if (selectedElement) {
          // Scroll horizontally within the date navigation container only
          const container = scrollContainerRef.current;
          
          // Calculate the scroll position to center the element horizontally
          const scrollLeft = selectedElement.offsetLeft - (container.offsetWidth / 2) + (selectedElement.offsetWidth / 2);
          
          container.scrollTo({
            left: scrollLeft,
            behavior: 'smooth'
          });
        }
      }
    }
  }, [selectedDate, dateOptions]);

  // Scroll navigation functions
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -200,
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 200,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="date-navigation-container">
      {/* Left scroll button */}
      <button 
        className="scroll-button scroll-left" 
        onClick={scrollLeft}
        aria-label="Scroll left"
      >
        ‹
      </button>
      
      {/* Date navigation with scroll */}
      <div className="date-navigation" ref={scrollContainerRef}>
        {dateOptions.map((option) => (
          <button
            key={option.value}
            className={`date-option ${selectedDate === option.value ? 'active' : ''}`}
            onClick={() => onDateChange(option.value)}
            title={option.formattedDate}
          >
            {option.label}
          </button>
        ))}
      </div>
      
      {/* Right scroll button */}
      <button 
        className="scroll-button scroll-right" 
        onClick={scrollRight}
        aria-label="Scroll right"
      >
        ›
      </button>
    </div>
  );
};
