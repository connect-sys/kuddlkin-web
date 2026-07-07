import React, { useState, useEffect } from 'react'
import { Star, MessageSquare, Calendar, User, Reply, TrendingUp, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'
import { useAuth } from '../contexts/AuthContext'

interface Review {
  id: string
  customer_name: string
  service_name: string
  rating: number
  comment: string
  booking_date: string
  created_at: string
  response: string | null
}

const Reviews: React.FC = () => {
  const { user } = useAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [averageRating, setAverageRating] = useState(0)
  const [totalReviews, setTotalReviews] = useState(0)
  const [loading, setLoading] = useState(true)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')

  useEffect(() => {
    fetchReviews()
  }, [user])

  const fetchReviews = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const token = localStorage.getItem('token') || localStorage.getItem('authToken')
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reviews/partner?providerId=${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      const data = await response.json()
      
      if (data.success) {
        setReviews(data.data.reviews || [])
        setAverageRating(data.data.averageRating || 0)
        setTotalReviews(data.data.totalReviews || 0)
      } else {
        console.error('Failed to fetch reviews:', data.message)
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClass = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-6 h-6' : 'w-4 h-4'
    
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`${sizeClass} ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  const handleReply = async (reviewId: string) => {
    if (!replyText.trim()) return
    
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken')
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reviews/reply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reviewId,
          response: replyText
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Update local state with the reply
        setReviews(prev => prev.map(review => 
          review.id === reviewId 
            ? { ...review, response: replyText }
            : review
        ))
        
        setReplyingTo(null)
        setReplyText('')
      } else {
        console.error('Failed to save reply:', data.message)
        alert('Failed to save reply. Please try again.')
      }
    } catch (error) {
      console.error('Error saving reply:', error)
      alert('Error saving reply. Please try again.')
    }
  }

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    reviews.forEach(review => {
      distribution[review.rating as keyof typeof distribution]++
    })
    return distribution
  }

  const ratingDistribution = getRatingDistribution()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#578f82]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reviews & Ratings</h1>
          <p className="text-gray-600">Manage customer feedback and improve your services</p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold">{averageRating}</div>
              <div className="flex">
                {renderStars(Math.round(averageRating), 'sm')}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Based on {totalReviews} reviews
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReviews}</div>
            <p className="text-xs text-muted-foreground">
              Customer feedback received
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <Reply className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalReviews > 0 ? Math.round((reviews.filter(r => r.response).length / totalReviews) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Reviews with responses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Rating Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Rating Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center space-x-3">
                <div className="flex items-center space-x-1 w-16">
                  <span className="text-sm font-medium">{rating}</span>
                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: totalReviews > 0 ? `${(ratingDistribution[rating as keyof typeof ratingDistribution] / totalReviews) * 100}%` : '0%'
                    }}
                  />
                </div>
                <span className="text-sm text-gray-500 w-8">
                  {ratingDistribution[rating as keyof typeof ratingDistribution]}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Recent Reviews</h2>
        
        {reviews.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
              <p className="text-gray-500">
                Your customer reviews will appear here once you complete services
              </p>
            </CardContent>
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <div className="flex items-start space-x-4">
                  <Avatar>
                    <AvatarFallback className="bg-[#578f82] text-white">
                      {review.customer_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{review.customer_name}</h4>
                        <p className="text-sm text-gray-500">{review.service_name}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-1">
                          {renderStars(review.rating, 'sm')}
                          <span className="text-sm font-medium ml-1">{review.rating}</span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {new Date(review.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-gray-700">{review.comment}</p>
                    
                    {review.response ? (
                      <div className="bg-gray-50 rounded-lg p-3 border-l-4 border-[#578f82]">
                        <div className="flex items-center space-x-2 mb-2">
                          <Reply className="w-4 h-4 text-[#578f82]" />
                          <span className="text-sm font-medium text-[#578f82]">Your Response</span>
                        </div>
                        <p className="text-sm text-gray-700">{review.response}</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {replyingTo === review.id ? (
                          <div className="space-y-2">
                            <textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Write your response..."
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#578f82] focus:border-transparent resize-none"
                              rows={3}
                            />
                            <div className="flex space-x-2">
                              <Button
                                onClick={() => handleReply(review.id)}
                                size="sm"
                                className="bg-[#578f82] hover:bg-[#4a7c70]"
                              >
                                Send Reply
                              </Button>
                              <Button
                                onClick={() => {
                                  setReplyingTo(null)
                                  setReplyText('')
                                }}
                                variant="outline"
                                size="sm"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button
                            onClick={() => setReplyingTo(review.id)}
                            variant="outline"
                            size="sm"
                            className="text-[#578f82] border-[#578f82] hover:bg-[#578f82] hover:text-white"
                          >
                            <Reply className="w-4 h-4 mr-2" />
                            Reply to Review
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

export default Reviews
