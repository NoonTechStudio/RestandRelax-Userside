import { ChevronRight } from "lucide-react";

const GuestSelector = ({
  adults,
  kids,
  onGuestChange,
  showGuestSelector,
  setShowGuestSelector,
  maxCapacity,
}) => {
  const currentTotal = adults + kids;

  const handleGuestChange = (type, operation) => {
    if (type === "adults") {
      if (operation === "increase" && currentTotal < maxCapacity) {
        onGuestChange("adults", adults + 1);
      } else if (operation === "decrease") {
        onGuestChange("adults", Math.max(1, adults - 1));
      }
    } else {
      if (operation === "increase" && currentTotal < maxCapacity) {
        onGuestChange("kids", kids + 1);
      } else if (operation === "decrease") {
        onGuestChange("kids", Math.max(0, kids - 1));
      }
    }
  };

  return (
    <div className="border border-gray-300 rounded-lg p-3 mb-4 relative">
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={() => setShowGuestSelector(!showGuestSelector)}
      >
        <div>
          <div className="text-xs font-semibold text-gray-700 mb-1">GUESTS</div>
          <div className="font-medium">
            {currentTotal} guest{currentTotal !== 1 ? "s" : ""}
            {adults > 0 && `, ${adults} adult${adults !== 1 ? "s" : ""}`}
            {kids > 0 && `, ${kids} kid${kids !== 1 ? "s" : ""}`}
          </div>
          {currentTotal > maxCapacity && (
            <div className="text-xs text-red-600 mt-1">
              Maximum {maxCapacity} guests allowed
            </div>
          )}
        </div>
        <ChevronRight size={20} />
      </div>

      {showGuestSelector && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10 p-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="font-medium">Adults</div>
              <div className="text-sm text-gray-500">Ages 13+</div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleGuestChange("adults", "decrease")}
                disabled={adults <= 1}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                -
              </button>
              <span className="font-medium w-6 text-center">{adults}</span>
              <button
                onClick={() => handleGuestChange("adults", "increase")}
                disabled={currentTotal >= maxCapacity}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium">Kids</div>
              <div className="text-sm text-gray-500">Ages 2-12</div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleGuestChange("kids", "decrease")}
                disabled={kids <= 0}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                -
              </button>
              <span className="font-medium w-6 text-center">{kids}</span>
              <button
                onClick={() => handleGuestChange("kids", "increase")}
                disabled={currentTotal >= maxCapacity}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                +
              </button>
            </div>
          </div>

          {/* Capacity information */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              <div className="font-medium mb-1">Capacity Limit</div>
              <p>
                Maximum {maxCapacity} guest{maxCapacity !== 1 ? "s" : ""}{" "}
                allowed
              </p>
              {currentTotal > maxCapacity && (
                <p className="text-red-600 font-medium mt-1">
                  Please reduce guest count to continue
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestSelector;
