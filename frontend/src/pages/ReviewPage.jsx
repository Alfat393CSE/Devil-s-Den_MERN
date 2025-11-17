import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// Review page has been removed — redirect users to Shop
const ReviewPage = () => {
  const navigate = useNavigate()
  useEffect(() => {
    navigate('/shop', { replace: true })
  }, [navigate])
  return null
}

export default ReviewPage
