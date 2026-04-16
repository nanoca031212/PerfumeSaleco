import { Star, ThumbsUp, ThumbsDown } from 'lucide-react'
import { useState } from 'react'

interface Review {
  id: number
  rating: number
  title: string
  content: string
  author: string
  location: string
  age?: string
  date: string
  isVerified: boolean
  helpfulVotes: number
  unhelpfulVotes: number
  reviewedAt?: string
}

interface ReviewSectionProps {
  reviews: Review[]
  averageRating: number
  totalReviews: number
  recommendationPercentage: number
  ratingDistribution: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
  qualityRating: number
  valueRating: number
}

export default function ReviewSection({
  reviews,
  averageRating,
  totalReviews,
  recommendationPercentage,
  ratingDistribution,
  qualityRating,
  valueRating
}: ReviewSectionProps) {
  const [sortBy, setSortBy] = useState('recent')
  const [searchTerm, setSearchTerm] = useState('')

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'fill-black text-black' : 'text-gray-300'}`}
      />
    ))
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 py-12 bg-gray-100">
      <h2 className="text-3xl font-bold mb-8 text-center">REVIEWS</h2>
      
      {/* Reviews Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="text-center md:text-left">
          <div className="text-6xl font-bold mb-2">{averageRating}</div>
          <div className="flex justify-center md:justify-start mb-4">
            {renderStars(Math.round(averageRating))}
          </div>
          <div className="text-lg mb-2">{totalReviews} REVIEWS</div>
          <div className="text-4xl font-bold mb-2">{recommendationPercentage}%</div>
          <div className="text-lg">WOULD RECOMMEND THIS TO A FRIEND</div>
        </div>

        <div>
          <h3 className="text-lg font-bold mb-4">RATINGS DISTRIBUTION</h3>
          {[5, 4, 3, 2, 1].map(stars => (
            <div key={stars} className="flex items-center mb-2">
              <div className="w-20">{stars} STARS</div>
              <div className="flex-grow bg-gray-200 h-4 mx-4">
                <div
                  className="bg-black h-full"
                  style={{
                    width: `${(ratingDistribution[stars as keyof typeof ratingDistribution] / totalReviews) * 100}%`
                  }}
                />
              </div>
              <div className="w-16 text-right">
                {ratingDistribution[stars as keyof typeof ratingDistribution]}
              </div>
            </div>
          ))}

          <div className="mt-8">
            <div className="mb-4">
              <div className="font-bold mb-2">Quality</div>
              <div className="flex">{renderStars(qualityRating)}</div>
            </div>
            <div>
              <div className="font-bold mb-2">Value</div>
              <div className="flex">{renderStars(valueRating)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Sort */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-grow">
          <input
            type="text"
            placeholder="Enter Search Terms"
            className="w-full px-4 py-2 border border-gray-300 rounded"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full md:w-64">
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="recent">Most Recent</option>
            <option value="highest">Highest Rated</option>
            <option value="lowest">Lowest Rated</option>
            <option value="helpful">Most Helpful</option>
          </select>
        </div>
      </div>

             {/* Reviews List */}
       <div className="space-y-8">
         {reviews.map((review) => (
           <div key={review.id} className=" rounded-lg shadow-sm p-6">
             <div className="flex items-center gap-2 mb-3">
               <div className="flex">{renderStars(review.rating)}</div>
               <div className="text-sm text-gray-500">• Verified Purchase</div>
             </div>
             
             <h3 className="text-xl font-bold mb-3">{review.title}</h3>
             
             <div className="flex items-center flex-wrap gap-2 text-sm text-gray-600 mb-4">
               <span className="font-medium">{review.author}</span>
               {review.location && (
                 <span className="text-gray-400">from {review.location}</span>
               )}
               {review.age && (
                 <span className="text-gray-400">• {review.age}</span>
               )}
               <span className="text-gray-400">• {review.date}</span>
             </div>

             {review.isVerified && (
               <div className="inline-flex items-center bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium mb-4">
                 <svg className="w-4 h-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                   <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                 </svg>
                 Verified Buyer
               </div>
             )}

             {review.reviewedAt && (
               <div className="text-sm text-gray-500 italic mb-4">
                 Originally reviewed at {review.reviewedAt}
               </div>
             )}

             <div className="prose prose-sm max-w-none mb-6">
               <p className="text-gray-700 leading-relaxed">{review.content}</p>
             </div>

             <div className="flex flex-col md:flex-row items-center gap-6 pt-4 border-t border-gray-100">
               <div>
                 <div className="font-medium text-sm mb-1">Bottom Line</div>
                 <div className="text-sm text-green-700">
                   <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                     <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                   </svg>
                   Yes, I would recommend to a friend
                 </div>
               </div>

               <div className="md:ml-auto flex items-center gap-6">
                 <div>
                   <div className="text-xs text-gray-500 mb-1">Was this review helpful?</div>
                   <div className="flex gap-3">
                     <button className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm border border-gray-200 hover:border-gray-300 transition-colors">
                       <ThumbsUp size={14} />
                       <span>{review.helpfulVotes}</span>
                     </button>
                     <button className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm border border-gray-200 hover:border-gray-300 transition-colors">
                       <ThumbsDown size={14} />
                       <span>{review.unhelpfulVotes}</span>
                     </button>
                   </div>
                 </div>
                 
                 <button className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
                   Report
                 </button>
               </div>
             </div>
           </div>
         ))}
       </div>
    </div>
  )
}
