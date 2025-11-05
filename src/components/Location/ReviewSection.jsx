import { useState } from 'react';
import { Star, Award } from 'lucide-react';
import { formatReviewDate } from '../../utils/locations/locationUitls';

// Guest Favorite Component
const GuestFavorite = ({ rating }) => {
  return (
    <div className="flex flex-col items-center justify-center bg-white p-6 mb-8 text-center max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-4xl font-bold text-gray-900">{rating}</span>
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={16}
              className={star <= Math.round(rating) ? "text-black fill-current" : "text-gray-300"}
            />
          ))}
        </div>
      </div>
      <div className="flex items-center justify-center gap-2 mb-2">
        <Award className="text-black" size={50} />
        <h3 className="text-4xl font-semibold text-gray-900">Guest favourite</h3>
      </div>
      <p className="text-gray-600 text-sm max-w-md leading-relaxed">
        This home is a guest favourite based on<br />
        ratings, reviews and reliability
      </p>
    </div>
  );
};

const ReviewsSection = ({ reviews, expandedReviews, onToggleReviewExpansion }) => {
  // 🔥 Add local state to toggle all reviews
  const [showAll, setShowAll] = useState(false);

  const averageRating = reviews?.summary?.averageRating || 0;

  const renderStars = (rating) => {
    const numericRating = Number(rating) || 0;
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={star <= numericRating ? "text-black fill-current" : "text-gray-300"}
          />
        ))}
      </div>
    );
  };

  if (!reviews?.reviews?.length) return null;

  // 🔥 Determine how many reviews to show
  const visibleReviews = showAll ? reviews.reviews : reviews.reviews.slice(0, 4);

  return (
    <div className="mt-16 border-t border-gray-200 pt-12">
      <div className="max-w-7xl mx-auto">
        {averageRating >= 4.5 && (
          <div className="mb-12">
            <GuestFavorite rating={averageRating} />
          </div>
        )}

        <h3 className="font-semibold text-2xl mb-8">Guest Reviews</h3>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {visibleReviews.map((review, index) => {
            const isExpanded = expandedReviews[review._id];
            const reviewText = review.reviewText || '';
            const shouldTruncate = reviewText.length > 150 && !isExpanded;
            const displayText = shouldTruncate
              ? `${reviewText.substring(0, 150)}...`
              : reviewText;

            return (
              <div
                key={review._id || index}
                className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
              >
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="font-semibold text-gray-600 text-sm">
                          {(review.guestName || 'Guest').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-base capitalize">
                          {review.guestName || 'Guest'}
                        </h4>
                        {review.yearsOnPlatform && (
                          <p className="text-gray-600 text-sm">
                            {review.yearsOnPlatform} years on Airbnb
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    {renderStars(review.rating)}
                    <span className="text-gray-500 text-sm">
                      {formatReviewDate(review.createdAt || review.stayDate)}
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-gray-700 leading-relaxed text-sm">
                    {displayText}
                  </p>

                  {reviewText.length > 150 && (
                    <button
                      onClick={() => onToggleReviewExpansion(review._id)}
                      className="text-gray-600 font-medium hover:text-gray-800 transition-colors mt-2 text-sm"
                    >
                      {isExpanded ? 'Show less' : 'Show more'}
                    </button>
                  )}
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  {review.guestLocation && (
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{review.guestLocation}</span>
                    </div>
                  )}
                  {review.stayDetails && (
                    <div className="flex items-center gap-1">
                      <span>{review.stayDetails}</span>
                      {review.travelGroup && (
                        <>
                          <span className="text-gray-400 mx-1">•</span>
                          <span>{review.travelGroup}</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 🔥 Toggle Button */}
        {reviews.reviews.length > 4 && (
          <div className="mt-10 text-center">
            <button
              onClick={() => setShowAll(!showAll)}
              className="px-8 py-3 border border-gray-400 rounded-lg font-medium hover:bg-gray-50 transition-colors text-gray-900 text-base"
            >
              {showAll
                ? 'Show less reviews'
                : `Show all ${reviews.reviews.length} reviews`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsSection;
