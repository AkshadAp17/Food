'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import { RestaurantPage } from '../../pages/RestaurantPage'

export default function Restaurant() {
  const params = useParams()
  
  // Inject the restaurant ID into the page component
  return <RestaurantPage />
}