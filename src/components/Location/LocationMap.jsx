import { MapPin, Flag, Navigation } from 'lucide-react';

const LocationMap = ({ location }) => {
  // Get coordinates from the nested structure
  const latitude = location?.coordinates?.lat;
  const longitude = location?.coordinates?.lng;
  const address = location?.address;

  // Generate OpenStreetMap link
  const generateOSMLink = () => {
    if (!latitude || !longitude) return '#';
    return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}&zoom=17`;
  };

  // Generate Google Maps link (alternative option)
  const generateGoogleMapsLink = () => {
    if (!latitude || !longitude) return '#';
    return `https://www.google.com/maps?q=${latitude},${longitude}&z=17`;
  };

  // ✅ Updated map embed for proper zoom & centering
  const renderMap = () => {
  if (!latitude || !longitude) {
    return (
      <div className="w-full h-100 bg-gray-100 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <MapPin size={48} className="mx-auto mb-2" />
          <p>Map location not available</p>
        </div>
      </div>
    );
  }

  // ✅ Use /map.html with zoom parameter for reliable zoomed-in view
  return (
    <iframe
      width="100%"
      height="100%"
      frameBorder="0"
      scrolling="no"
      marginHeight="0"
      marginWidth="0"
      src={`https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.0008},${latitude - 0.0008},${longitude + 0.0008},${latitude + 0.0008}&layer=mapnik&marker=${latitude},${longitude}`}
      className="h-96 w-full"
      title="Location Map"
    />
  );
};


  const formatAddress = () => {
    if (!address) return 'Address information not available';

    const parts = [];
    if (address.line1) parts.push(address.line1);
    if (address.line2) parts.push(address.line2);
    if (address.city) parts.push(address.city);
    if (address.state) parts.push(address.state);
    if (address.pincode) parts.push(address.pincode);

    return parts.join(', ') || 'Address information not available';
  };

  // Sample nearby places - you can replace with actual data from your API
  const nearbyPlaces = [
    "Sursagar Lake",
    "Waghodia Road",
    "Vadodara City Center",
    "Local Markets"
  ];

  return (
    <div className="mt-16 border-t border-gray-200 pt-12 w-full">
      <div className="w-full">
        <h3 className="font-semibold text-2xl mb-8 px-6">Where you'll be</h3>

        {/* Full Width Map Container */}
        <div className="w-full">
          <div className="border border-gray-200 rounded-xl overflow-hidden mx-6">
            {/* Map Container */}
            <div className="relative bg-gray-100 w-full">
              {renderMap()}

              {/* Fallback marker when no location */}
              {!latitude || !longitude ? (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="flex flex-col items-center">
                    <div className="bg-red-600 text-white p-2 rounded-full shadow-lg">
                      <MapPin size={20} />
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Map Footer */}
            <div className="bg-white p-3 border-t border-gray-200 w-full">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span>Map Data © OpenStreetMap</span>
                  <span>•</span>
                  <span>200m</span>
                  <span>•</span>
                  <span>Terms</span>
                </div>

                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-800 transition-colors px-2 py-1 rounded hover:bg-gray-100">
                    <Flag size={14} />
                    Report map error
                  </button>

                  {latitude && longitude && (
                    <div className="flex gap-2">
                      <a
                        href={generateOSMLink()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-blue-700 transition-colors"
                      >
                        <Navigation size={14} />
                        OSM
                      </a>
                      <a
                        href={generateGoogleMapsLink()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-green-700 transition-colors"
                      >
                        <Navigation size={14} />
                        Google
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationMap;
