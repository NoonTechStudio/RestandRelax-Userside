import { Grid3x3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ImageGallery = ({ locationId, images }) => {
  const navigate = useNavigate();
  const { mainImage, otherImages, allImages } = images;
  const remainingImagesCount = Math.max(0, allImages.length - 5);

  // SIMPLE URL EXTRACTOR - Just get the URL from the object
  const getImageUrl = (image) => {
    if (!image) return null;

    // If it's already a string URL, use it directly
    if (typeof image === "string") {
      return image;
    }

    // If it's an object with url property, use that
    if (typeof image === "object" && image.url) {
      return image.url;
    }

    return null;
  };

  // Handle image load error
  const handleImageError = (e, imageType, imageData) => {
    console.error(`Failed to load ${imageType} image:`, imageData);
    console.error("Attempted URL:", e.target.src);
    e.target.src =
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80";
  };

  const handleImageClick = (imageIndex) => {
    navigate(`/locations-details/${locationId}/photos`, {
      state: {
        images: allImages,
        currentIndex: imageIndex,
      },
    });
  };

  const handleShowAllPhotos = () => {
    navigate(`/locations-details/${locationId}/photos`, {
      state: {
        images: allImages,
        currentIndex: 0,
      },
    });
  };

  // Debug logs to verify what we're receiving
  console.log("ImageGallery received:", {
    mainImage,
    otherImages,
    allImagesCount: allImages?.length,
  });

  return (
    <div className="relative mb-8">
      <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[500px] rounded-xl overflow-hidden">
        {/* Main image */}
        <div className="col-span-2 row-span-2 bg-gray-200 animate-fadeIn">
          {mainImage ? (
            <img
              src={getImageUrl(mainImage)}
              alt="Property main view"
              className="w-full h-full object-cover cursor-pointer hover:brightness-90 transition-all duration-200"
              onClick={() => {
                const mainImageIndex = allImages.findIndex(
                  (img) => img === mainImage,
                );
                handleImageClick(mainImageIndex >= 0 ? mainImageIndex : 0);
              }}
              onError={(e) => handleImageError(e, "main", mainImage)}
              onLoad={() => console.log("✅ Main image loaded")}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <Grid3x3 className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">Main Image</p>
                <p className="text-xs">Not available</p>
              </div>
            </div>
          )}
        </div>

        {/* Other images */}
        {[0, 1, 2, 3].map((index) => {
          const imageObj = otherImages?.[index] || allImages?.[index + 1];
          const imageUrl = getImageUrl(imageObj);

          return (
            <div
              key={index}
              className="col-span-1 row-span-1 bg-gray-200 animate-fadeIn"
              style={{ animationDelay: `${(index + 1) * 100}ms` }}
            >
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={`Property view ${index + 2}`}
                  className="w-full h-full object-cover cursor-pointer hover:brightness-90 transition-all duration-200"
                  onClick={() => {
                    const imageIndex = allImages.findIndex(
                      (img) => img === imageObj,
                    );
                    handleImageClick(imageIndex >= 0 ? imageIndex : index + 1);
                  }}
                  onError={(e) =>
                    handleImageError(e, `other-${index}`, imageObj)
                  }
                  onLoad={() => console.log(`✅ Other image ${index} loaded`)}
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <Grid3x3 className="w-6 h-6 mx-auto mb-1" />
                    <p className="text-xs">Image {index + 2}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Show all photos button */}
      {remainingImagesCount > 0 && (
        <button
          onClick={handleShowAllPhotos}
          className="absolute bottom-4 right-4 bg-white px-4 py-3 rounded-lg flex items-center gap-2 font-medium text-sm hover:bg-gray-50 shadow-lg border border-gray-200 z-10 animate-fadeIn"
          style={{ animationDelay: "500ms" }}
        >
          <Grid3x3 size={16} />
          Show all {allImages.length} photos
        </button>
      )}
    </div>
  );
};

export default ImageGallery;
