'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import { TrackOrderPageVisual } from '../../pages/TrackOrderPageVisual'

export default function TrackOrder() {
  const params = useParams()
  
  return <TrackOrderPageVisual />
}