import { ChevronRight, Calendar } from 'lucide-react';
import React, { useEffect, useRef, useCallback, useMemo } from 'react';

const GuestSelector = ({ 
  adults, 
  kids, 
  onGuestChange, 
  showGuestSelector, 
  setShowGuestSelector,
  maxCapacity,
  onCalendarClick,
  checkInDate,
  checkOutDate
}) => {
  const dropdownRef = useRef(null);

  // Memoized total guests
  const currentTotal = useMemo(() => adults + kids, [adults, kids]);

  // Stable guest change handler
  const handleGuestChange = useCallback((type, operation) => {
    if (type === 'adults') {
      if (operation === 'increase' && currentTotal < maxCapacity) {
        onGuestChange('adults', adults + 1);
      } else if (operation === 'decrease') {
        onGuestChange('adults', Math.max(1, adults - 1));
      }
    } else {
      if (operation === 'increase' && currentTotal < maxCapacity) {
        onGuestChange('kids', kids + 1);
      } else if (operation === 'decrease') {
        onGuestChange('kids', Math.max(0, kids - 1));
      }
    }
  }, [adults, kids, currentTotal, maxCapacity, onGuestChange]);

  // Stable click outside handler
  const handleClickOutside = useCallback((event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setShowGuestSelector(false);
    }
  }, [setShowGuestSelector]);

  // Attach/detach event listener
  useEffect(() => {
    if (showGuestSelector) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showGuestSelector, handleClickOutside]);

  // Memoized guest description
  const guestDescription = useMemo(() => {
    let desc = `${currentTotal} guest${currentTotal !== 1 ? 's' : ''}`;
    if (adults > 0) desc += `, ${adults} adult${adults !== 1 ? 's' : ''}`;
    if (kids > 0) desc += `, ${kids} kid${kids !== 1 ? 's' : ''}`;
    return desc;
  }, [currentTotal, adults, kids]);

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex flex-col">
        {/* Guest selector toggle */}
        <div 
          className={`flex justify-between items-center cursor-pointer p-3 ${checkInDate || checkOutDate ? 'border-t border-gray-300' : ''}`}
          onClick={() => setShowGuestSelector(!showGuestSelector)}
        >
          <div>
            <div className="text-xs font-semibold text-gray-700 mb-1">GUESTS</div>
            <div className="font-medium">
              {guestDescription}
            </div>
            {currentTotal > maxCapacity && (
              <div className="text-xs text-red-600 mt-1">
                Maximum {maxCapacity} guests allowed
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {onCalendarClick && (!checkInDate || !checkOutDate) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCalendarClick();
                }}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                title="Select dates"
              >
                <Calendar size={16} className="text-gray-500" />
              </button>
            )}
            <ChevronRight 
              size={20} 
              className={`transition-transform ${showGuestSelector ? 'rotate-90' : ''}`}
            />
          </div>
        </div>
      </div>

      {/* Guest selector dropdown */}
      {showGuestSelector && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-xl z-50 p-4">
          {/* Quick date selection hint */}
          {(!checkInDate || !checkOutDate) && onCalendarClick && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-blue-800 text-sm mb-1">Select Dates</div>
                  <div className="text-xs text-blue-600">
                    Choose check-in and checkout dates to see pricing
                  </div>
                </div>
                {/* <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCalendarClick();
                    setShowGuestSelector(false);
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Calendar size={14} />
                  Pick Dates
                </button> */}
              </div>
            </div>
          )}

          {/* Adults selector */}
          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="font-medium">Adults</div>
              <div className="text-sm text-gray-500">Ages 13+</div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleGuestChange('adults', 'decrease');
                }}
                disabled={adults <= 1}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-400 transition-colors"
              >
                -
              </button>
              <span className="font-medium w-6 text-center">{adults}</span>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleGuestChange('adults', 'increase');
                }}
                disabled={currentTotal >= maxCapacity}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-400 transition-colors"
              >
                +
              </button>
            </div>
          </div>
          
          {/* Kids selector */}
          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium">Kids</div>
              <div className="text-sm text-gray-500">Ages 2-12</div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleGuestChange('kids', 'decrease');
                }}
                disabled={kids <= 0}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-400 transition-colors"
              >
                -
              </button>
              <span className="font-medium w-6 text-center">{kids}</span>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleGuestChange('kids', 'increase');
                }}
                disabled={currentTotal >= maxCapacity}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-400 transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Capacity information */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              <div className="font-medium mb-1">Capacity Limit</div>
              <p>Maximum {maxCapacity} guest{maxCapacity !== 1 ? 's' : ''} allowed</p>
              {currentTotal > maxCapacity && (
                <p className="text-red-600 font-medium mt-1">
                  Please reduce guest count to continue
                </p>
              )}
            </div>
            
            {/* Date reminder */}
            {onCalendarClick && (!checkInDate || !checkOutDate) && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCalendarClick();
                    setShowGuestSelector(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-md transition-colors"
                >
                  <Calendar size={14} />
                  Select dates to continue
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(GuestSelector);