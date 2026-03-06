import { ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useState, useEffect, useCallback, useMemo } from 'react';

// Memoized calendar grid component to prevent unnecessary re-renders
const CalendarGrid = React.memo(({
  monthIndex,
  months,
  daysOfWeek,
  selectedDates,
  checkInDate,
  checkOutDate,
  onDateClick,
  bookedDates
}) => {
  // Generate days array for the month – memoized to avoid recalculation
  const calendarDays = useMemo(() => {
    if (!months[monthIndex]) return [];
    const month = months[monthIndex];
    const { days, startDay } = month;
    const daysArray = [];
    for (let i = 0; i < startDay; i++) daysArray.push(null);
    for (let i = 1; i <= days; i++) daysArray.push(i);
    return daysArray;
  }, [months, monthIndex]);

  // Helper functions (defined inside to keep them close to usage, no need for useCallback)
  const isDateSelected = (day) => {
    if (!day || !months[monthIndex]) return false;
    const month = months[monthIndex];
    const currentDate = new Date(month.year, month.month, day);
    return selectedDates.some(date => 
      date.getDate() === currentDate.getDate() &&
      date.getMonth() === currentDate.getMonth() &&
      date.getFullYear() === currentDate.getFullYear()
    );
  };

  const isDateInRange = (day) => {
    if (!day || !checkInDate || !checkOutDate || !months[monthIndex]) return false;
    const month = months[monthIndex];
    const currentDate = new Date(month.year, month.month, day);
    return currentDate > checkInDate && currentDate < checkOutDate;
  };

  const isCheckInDate = (day) => {
    if (!day || !checkInDate || !months[monthIndex]) return false;
    const month = months[monthIndex];
    const currentDate = new Date(month.year, month.month, day);
    return currentDate.getTime() === checkInDate.getTime();
  };

  const isCheckOutDate = (day) => {
    if (!day || !checkOutDate || !months[monthIndex]) return false;
    const month = months[monthIndex];
    const currentDate = new Date(month.year, month.month, day);
    return currentDate.getTime() === checkOutDate.getTime();
  };

  const isDateBooked = (day) => {
    if (!day || !months[monthIndex]) return false;
    const month = months[monthIndex];
    const currentDate = new Date(month.year, month.month, day);
    const year = currentDate.getFullYear();
    const monthNum = currentDate.getMonth() + 1;
    const dayNum = currentDate.getDate();
    const currentDateStr = `${year}-${monthNum.toString().padStart(2, '0')}-${dayNum.toString().padStart(2, '0')}`;
    return bookedDates.includes(currentDateStr);
  };

  const isDateDisabled = (day) => {
    if (!day || !months[monthIndex]) return true;
    const month = months[monthIndex];
    const currentDate = new Date(month.year, month.month, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return currentDate < today || isDateBooked(day);
  };

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {daysOfWeek.map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          const isBooked = isDateBooked(day);
          const isDisabled = isDateDisabled(day);

          return (
            <button
              key={index}
              onClick={() => !isDisabled && onDateClick(day, monthIndex)}
              disabled={isDisabled}
              className={`
                h-12 md:h-10 rounded-lg text-sm font-medium transition-all relative
                ${!day ? 'invisible' : ''}
                ${isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                
                // Selected date styling
                ${isDateSelected(day) ? 'bg-pink-600 text-white' : ''}
                
                // Range styling
                ${isDateInRange(day) ? 'bg-pink-100' : ''}
                ${isCheckInDate(day) ? 'bg-pink-600 text-white rounded-l-lg' : ''}
                ${isCheckOutDate(day) ? 'bg-pink-600 text-white rounded-r-lg' : ''}
                
                // Booked date styling (only for paid bookings)
                ${isBooked ? 'bg-green-100 text-green-800 border border-green-300' : ''}
                
                // Normal date styling
                ${!isDateSelected(day) && !isDateInRange(day) && !isBooked && !isDisabled ? 
                  'hover:bg-gray-100 text-gray-900' : ''}
              `}
              title={isBooked ? 'Booked (Paid)' : ''}
            >
              {day}
              
              {/* Status indicator dot for booked dates */}
              {isBooked && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-green-500" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
});

const Calenderdates = ({ 
  months, 
  currentMonth, 
  onMonthChange, 
  selectedDates, 
  checkInDate, 
  checkOutDate, 
  onDateClick,
  daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  locationId
}) => {
  const [bookedDates, setBookedDates] = useState([]);
  const [loading, setLoading] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_CONNECTION_HOST;

  // Memoize fetch function to keep it stable for useEffect
  const fetchBookedDates = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/bookings/dates/${locationId}`
      );
      const result = await response.json();

      if (result.success && Array.isArray(result.bookedDates)) {
        setBookedDates(result.bookedDates); // ['YYYY-MM-DD']
      } else {
        setBookedDates([]);
      }

      console.log("Booked dates:", result.bookedDates);
    } catch (error) {
      console.error("Error fetching booked dates:", error);
      setBookedDates([]);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, locationId]); // locationId is already a dependency

  // Fetch booked dates when locationId changes
  useEffect(() => {
    if (locationId) {
      fetchBookedDates();
    }
  }, [locationId, fetchBookedDates]); // Added fetchBookedDates for correctness

  // Memoize month names to avoid recomputation on every render
  const currentMonthName = useMemo(() => months[currentMonth]?.name || 'Loading...', [months, currentMonth]);
  const nextMonthName = useMemo(() => months[currentMonth + 1]?.name || '', [months, currentMonth]);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-6">
      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 mb-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
          <span>Paid Booking</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-pink-600 rounded"></div>
          <span>Selected</span>
        </div>
      </div>

      {/* Month navigation */}
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={() => onMonthChange(currentMonth - 1)}
          disabled={currentMonth === 0}
          className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={20} />
        </button>
        
        {/* Month names – responsive: only current month on mobile, both on larger screens */}
        <div className="flex gap-2 md:gap-8">
          <span className="font-semibold">{currentMonthName}</span>
          {currentMonth < months.length - 1 && (
            <span className="font-semibold hidden md:inline">{nextMonthName}</span>
          )}
        </div>
        
        <button 
          onClick={() => onMonthChange(currentMonth + 1)}
          disabled={currentMonth >= months.length - 2}
          className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Calendar grids – single column on mobile, two columns on larger screens */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
          <CalendarGrid
            monthIndex={currentMonth}
            months={months}
            daysOfWeek={daysOfWeek}
            selectedDates={selectedDates}
            checkInDate={checkInDate}
            checkOutDate={checkOutDate}
            onDateClick={onDateClick}
            bookedDates={bookedDates}
          />
          {currentMonth < months.length - 1 && (
            <div className="hidden md:block">
              <CalendarGrid
                monthIndex={currentMonth + 1}
                months={months}
                daysOfWeek={daysOfWeek}
                selectedDates={selectedDates}
                checkInDate={checkInDate}
                checkOutDate={checkOutDate}
                onDateClick={onDateClick}
                bookedDates={bookedDates}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Memoize the main component to avoid re-renders when parent props haven't changed
export default React.memo(Calenderdates);