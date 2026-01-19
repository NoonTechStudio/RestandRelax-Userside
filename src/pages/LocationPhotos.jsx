import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  X,
  ChevronLeft,
  MapPin,
  Bed,
  Bath,
  Utensils,
  Sofa,
  Home,
  Waves,
} from "lucide-react";
import axios from "axios";

function LocationPhotos() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  // NOTE: Logic remains the same
  const { images, currentIndex } = location.state || {
    images: [],
    currentIndex: 0,
  };
  const [currentImageIndex, setCurrentImageIndex] = useState(currentIndex);
  const [locationData, setLocationData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const API_BASE_URL = import.meta.env.VITE_API_CONNECTION_HOST;

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(`${API_BASE_URL}/locations/${id}`);
        setLocationData(res.data);
      } catch (err) {
        console.error("Error fetching location:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLocation();
  }, [id]);

  const generateRoomTypes = () => {
    if (!locationData) return [];

    const rooms = [];
    const details = locationData.propertyDetails || {};
    const imageList = locationData.images || [];

    imageList.forEach((img, index) => {
      const title = img.title || img.alt || `Image ${index + 1}`;
      const imageName = title.toLowerCase();

      let roomName = title;
      let icon = Home;

      if (imageName.includes("living") || imageName.includes("lounge")) {
        roomName = "Living room";
        icon = Sofa;
      } else if (
        imageName.includes("kitchen") ||
        imageName.includes("dining")
      ) {
        roomName = imageName.includes("dining")
          ? "Dining area"
          : "Full kitchen";
        icon = Utensils;
      } else if (imageName.includes("bedroom") || imageName.includes("bed")) {
        roomName = "Bedroom";
        icon = Bed;
      } else if (imageName.includes("bathroom") || imageName.includes("bath")) {
        roomName = "Full bathroom";
        icon = Bath;
      } else if (imageName.includes("pool") || imageName.includes("swim")) {
        roomName = "Swimming Pool";
        icon = Waves;
      } else if (
        imageName.includes("garden") ||
        imageName.includes("outdoor") ||
        imageName.includes("patio")
      ) {
        roomName = "Garden Area";
        icon = Home;
      }

      rooms.push({
        name: roomName,
        icon: icon,
        imageUrl: img.url,
        alt: img.alt || roomName,
        title: img.title || roomName,
      });
    });

    return rooms;
  };

  const roomTypes = generateRoomTypes();
  // State for tracking the currently visible room based on scroll
  const [activeRoomIndex, setActiveRoomIndex] = useState(0);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "Escape") navigate(-1);
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [navigate]);

  // Logic to track scroll position and update activeRoomIndex
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.id.split("-")[1]);
            setActiveRoomIndex(index);
          }
        });
      },
      {
        root: document.querySelector(".flex-1.overflow-y-auto"),
        rootMargin: "0px 0px -50% 0px", // When the item crosses the middle of the viewport
        threshold: 0,
      },
    );

    roomTypes.forEach((_, index) => {
      const element = document.getElementById(`room-${index}`);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      roomTypes.forEach((_, index) => {
        const element = document.getElementById(`room-${index}`);
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, [roomTypes]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gray-50 z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-700 font-medium">
            Loading photo gallery...
          </p>
        </div>
      </div>
    );
  }

  // --- START OF REVISED UI (Gallery Style) ---
  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header - Minimalist and Clean */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-gray-500 hover:text-gray-900 transition-colors p-2 rounded-full hover:bg-gray-100"
          aria-label="Go back"
        >
          <ChevronLeft size={20} />
          <span className="sr-only sm:not-sr-only text-sm font-medium">
            Back
          </span>
        </button>

        {locationData && (
          <div className="flex-1 text-center hidden sm:block">
            <div className="flex items-center justify-center gap-2 text-gray-700 text-base font-semibold">
              <MapPin size={16} className="text-indigo-500" />
              <span className="truncate max-w-xs">{locationData.name}</span>
            </div>
          </div>
        )}

        <button
          onClick={() => navigate(-1)}
          className="text-gray-500 hover:text-gray-900 transition-colors p-2 rounded-full hover:bg-gray-100"
          aria-label="Close gallery"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto" role="main">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
          {/* Title Section */}
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-2 tracking-tight">
            Photo Tour
          </h1>
          {locationData && (
            <p className="text-xl text-gray-500 mb-12 flex items-center gap-2">
              <MapPin size={20} className="text-indigo-400" />
              {locationData.name}
            </p>
          )}

          {/* Sticky Navigation Bar */}
          <div className="sticky top-[72px] z-[5] bg-white pt-2 pb-4 mb-12 overflow-x-auto border-b border-gray-200 shadow-sm">
            <div className="flex gap-3">
              {roomTypes.map((room, index) => {
                const IconComponent = room.icon;
                const isActive = index === activeRoomIndex;
                return (
                  <button
                    key={index}
                    onClick={() => {
                      const element = document.getElementById(`room-${index}`);
                      if (element) {
                        element.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                          inline: "nearest",
                        });
                      }
                    }}
                    className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <IconComponent size={18} />
                    <span>{room.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Gallery Section - Full Width, Sectional Focus */}
          <div className="space-y-16">
            {roomTypes.map((room, index) => {
              const IconComponent = room.icon;
              return (
                <div key={index} id={`room-${index}`} className="scroll-mt-36">
                  {/* Image Container - Full Width */}
                  <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl border border-gray-100 group">
                    {/* The Image */}
                    <img
                      src={`${room.imageUrl}`}
                      alt={room.alt}
                      className="w-full object-cover aspect-video transition-transform duration-700 group-hover:scale-[1.02]"
                      onError={(e) => {
                        e.target.src =
                          "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1400&h=800&fit=crop";
                      }}
                    />

                    {/* Title Overlay (for drama and focus) */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-6 sm:p-8 text-white">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 bg-white/20 backdrop-blur-sm rounded-full">
                          <IconComponent size={24} className="text-white" />
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-extrabold drop-shadow-lg">
                          {room.alt}
                        </h2>
                      </div>
                      <p className="text-lg font-light opacity-80">
                        {room.title}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State - Updated Styling */}
          {roomTypes.length === 0 && (
            <div className="text-center py-20 border-2 border-dashed border-gray-300 rounded-xl mt-12 bg-gray-50">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Home size={32} className="text-indigo-500" />
              </div>
              <p className="text-xl font-bold text-gray-900 mb-2">
                No photos available
              </p>
              <p className="text-gray-600">
                This property doesn't have any photos in its listing yet. Check
                back soon!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LocationPhotos;
