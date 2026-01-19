import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

const Calenderdates = ({
  months,
  currentMonth,
  onMonthChange,
  selectedDates,
  checkInDate,
  checkOutDate,
  onDateClick,
  daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"],
  locationId,
}) => {
  const [bookedDates, setBookedDates] = useState([]);
  const [loading, setLoading] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_CONNECTION_HOST;

  // Fetch booked dates when locationId changes
  useEffect(() => {
    if (locationId) {
      fetchBookedDates();
    }
  }, [locationId]);

  const fetchBookedDates = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/bookings/dates/${locationId}`,
      );
      const result = await response.json();
      if (result.success) {
        // Backend now only returns paid bookings with checkout date included
        setBookedDates(result.bookedDates);
      }
    } catch (error) {
      console.error("Error fetching booked dates:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateCalendarDays = (monthIndex) => {
    if (!months[monthIndex]) return [];

    const month = months[monthIndex];
    const { days, startDay } = month;
    const calendarDays = [];

    for (let i = 0; i < startDay; i++) {
      calendarDays.push(null);
    }

    for (let i = 1; i <= days; i++) {
      calendarDays.push(i);
    }

    return calendarDays;
  };

  const isDateSelected = (day, monthIndex) => {
    if (!day || !months[monthIndex]) return false;

    const month = months[monthIndex];
    const currentDate = new Date(month.year, month.month, day);

    return selectedDates.some(
      (date) =>
        date.getDate() === currentDate.getDate() &&
        date.getMonth() === currentDate.getMonth() &&
        date.getFullYear() === currentDate.getFullYear(),
    );
  };

  const isDateInRange = (day, monthIndex) => {
    if (!day || !checkInDate || !checkOutDate || !months[monthIndex])
      return false;

    const month = months[monthIndex];
    const currentDate = new Date(month.year, month.month, day);

    return currentDate > checkInDate && currentDate < checkOutDate;
  };

  const isCheckInDate = (day, monthIndex) => {
    if (!day || !checkInDate || !months[monthIndex]) return false;

    const month = months[monthIndex];
    const currentDate = new Date(month.year, month.month, day);

    return currentDate.getTime() === checkInDate.getTime();
  };

  const isCheckOutDate = (day, monthIndex) => {
    if (!day || !checkOutDate || !months[monthIndex]) return false;

    const month = months[monthIndex];
    const currentDate = new Date(month.year, month.month, day);

    return currentDate.getTime() === checkOutDate.getTime();
  };

  // Check if date is booked (only for paid bookings)
  const isDateBooked = (day, monthIndex) => {
    if (!day || !months[monthIndex]) return false;

    const month = months[monthIndex];
    const currentDate = new Date(month.year, month.month, day);

    // Now only paid bookings are considered as "booked"
    return bookedDates.some((booked) => {
      const bookedDate = new Date(booked.date);
      return (
        bookedDate.getDate() === currentDate.getDate() &&
        bookedDate.getMonth() === currentDate.getMonth() &&
        bookedDate.getFullYear() === currentDate.getFullYear()
      );
    });
  };

  // Check if date should be disabled
  const isDateDisabled = (day, monthIndex) => {
    if (!day || !months[monthIndex]) return true;

    const month = months[monthIndex];
    const currentDate = new Date(month.year, month.month, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Disable past dates and booked dates (only paid bookings)
    return currentDate < today || isDateBooked(day, monthIndex);
  };

  const CalendarGrid = ({ monthIndex }) => (
    <div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {daysOfWeek.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-gray-500 py-2"
          >
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {generateCalendarDays(monthIndex).map((day, index) => {
          const isBooked = isDateBooked(day, monthIndex);
          const isDisabled = isDateDisabled(day, monthIndex);

          return (
            <button
              key={index}
              onClick={() => !isDisabled && onDateClick(day, monthIndex)}
              disabled={isDisabled}
              className={`
                h-10 rounded-lg text-sm font-medium transition-all relative
                ${!day ? "invisible" : ""}
                ${isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
                
                // Selected date styling
                ${isDateSelected(day, monthIndex) ? "bg-pink-600 text-white" : ""}
                
                // Range styling
                ${isDateInRange(day, monthIndex) ? "bg-pink-100" : ""}
                ${isCheckInDate(day, monthIndex) ? "bg-pink-600 text-white rounded-l-lg" : ""}
                ${isCheckOutDate(day, monthIndex) ? "bg-pink-600 text-white rounded-r-lg" : ""}
                
                // Booked date styling (only for paid bookings)
                ${isBooked ? "bg-green-100 text-green-800 border border-green-300" : ""}
                
                // Normal date styling
                ${
                  !isDateSelected(day, monthIndex) &&
                  !isDateInRange(day, monthIndex) &&
                  !isBooked
                    ? "hover:bg-gray-100 text-gray-900"
                    : ""
                }
              `}
              title={isBooked ? "Booked (Paid)" : ""}
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

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      {/* Updated Legend - only showing paid bookings now */}
      <div className="flex justify-center gap-4 mb-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
          <span>Paid Booking</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-pink-600 rounded"></div>
          <span>Selected</span>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => onMonthChange(currentMonth - 1)}
          disabled={currentMonth === 0}
          className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="flex gap-8">
          <span className="font-semibold">
            {months[currentMonth]?.name || "Loading..."}
          </span>
          {currentMonth < months.length - 1 && (
            <span className="font-semibold">
              {months[currentMonth + 1]?.name || ""}
            </span>
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

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-8">
          <CalendarGrid monthIndex={currentMonth} />
          {currentMonth < months.length - 1 && (
            <CalendarGrid monthIndex={currentMonth + 1} />
          )}
        </div>
      )}
    </div>
  );
};

export default Calenderdates;
