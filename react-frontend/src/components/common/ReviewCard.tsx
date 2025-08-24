import React from 'react';
import { Review } from '@/services/review.service';

interface ReviewCardProps {
  review: Review;
  onHelpful?: (id: string) => void;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review, onHelpful }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  return (
    <div className="border border-primary-200 rounded-lg p-6">
      <div className="flex items-start gap-4 mb-4">
        <img
          src={review.userAvatar || `https://ui-avatars.com/api/?name=${review.userName}&background=3B82F6&color=fff`}
          alt={review.userName}
          className="w-12 h-12 rounded-full"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-primary-900">{review.userName}</h4>
            {review.verified && (
              <span className="bg-emerald text-white px-2 py-1 rounded text-xs font-bold">✓ Verified</span>
            )}
          </div>
          <div className="flex items-center gap-2 mb-2">
            <div className="text-amber-premium">{renderStars(review.rating)}</div>
            <span className="text-sm text-primary-500">{formatDate(review.createdAt)}</span>
          </div>
        </div>
      </div>

      {review.title && (
        <h5 className="font-semibold text-primary-900 mb-2">{review.title}</h5>
      )}
      
      <p className="text-primary-700 leading-relaxed mb-4">{review.comment}</p>

      {review.images && review.images.length > 0 && (
        <div className="flex gap-2 mb-4">
          {review.images.slice(0, 3).map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Review image ${index + 1}`}
              className="w-16 h-16 object-cover rounded-lg"
            />
          ))}
          {review.images.length > 3 && (
            <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center text-xs text-primary-600">
              +{review.images.length - 3}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <button
          onClick={() => onHelpful?.(review.id)}
          className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-900 transition-colors"
        >
          <span>👍</span>
          <span>Helpful ({review.helpful})</span>
        </button>
      </div>
    </div>
  );
};

export default ReviewCard;