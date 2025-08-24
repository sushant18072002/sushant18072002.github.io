import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from './Button';
import { reviewService } from '@/services/review.service';

const reviewSchema = z.object({
  rating: z.number().min(1, 'Rating is required').max(5),
  title: z.string().min(5, 'Title must be at least 5 characters'),
  comment: z.string().min(20, 'Comment must be at least 20 characters')
});

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string;
  itemType: string;
  itemTitle: string;
  onReviewSubmitted?: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  itemId,
  itemType,
  itemTitle,
  onReviewSubmitted
}) => {
  const [loading, setLoading] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);

  const form = useForm({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      title: '',
      comment: ''
    }
  });

  const handleSubmit = async (data: z.infer<typeof reviewSchema>) => {
    setLoading(true);
    try {
      await reviewService.createReview({
        itemId,
        itemType,
        ...data
      });
      onReviewSubmitted?.();
      onClose();
      form.reset();
    } catch (error) {
      console.error('Failed to submit review:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-2xl text-primary-400 hover:text-primary-600"
        >
          ×
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-primary-900 mb-2">Write a Review</h2>
          <p className="text-primary-600">{itemTitle}</p>
        </div>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-primary-900 mb-3">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => form.setValue('rating', star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className={`text-3xl transition-colors ${
                    star <= (hoveredRating || form.watch('rating'))
                      ? 'text-amber-premium'
                      : 'text-primary-200'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
            {form.formState.errors.rating && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.rating.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-primary-900 mb-2">Title</label>
            <input
              {...form.register('title')}
              placeholder="Summarize your experience"
              className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
            />
            {form.formState.errors.title && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-primary-900 mb-2">Your Review</label>
            <textarea
              {...form.register('comment')}
              rows={4}
              placeholder="Tell others about your experience..."
              className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent resize-none"
            />
            {form.formState.errors.comment && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.comment.message}</p>
            )}
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;