/**
 * Razorpay Payment Gateway Integration Utility (Test Mode & Production)
 *
 * Dynamically loads official Razorpay Checkout SDK and provides
 * type-safe interfaces for opening the checkout popup and handling callbacks.
 */

export interface RazorpaySuccessResponse {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

export interface RazorpayFailureResponse {
  error: {
    code: string
    description: string
    source: string
    step: string
    reason: string
    metadata: {
      order_id: string
      payment_id?: string
    }
  }
}

export interface RazorpayCheckoutOptions {
  key: string
  amount: number // in paise (e.g. 50000 = ₹500)
  currency?: string
  name: string
  description?: string
  image?: string
  order_id: string
  handler: (response: RazorpaySuccessResponse) => void | Promise<void>
  prefill?: {
    name?: string
    email?: string
    contact?: string
  }
  notes?: Record<string, string>
  theme?: {
    color?: string
    backdrop_color?: string
    hide_topbar?: boolean
  }
  modal?: {
    ondismiss?: () => void
    escape?: boolean
    backdropclose?: boolean
    confirm_close?: boolean
    animation?: boolean
  }
}

export interface RazorpayInstance {
  open: () => void
  close: () => void
  on: (event: string, callback: (response: any) => void) => void
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => RazorpayInstance
  }
}

/**
 * Dynamically loads the official Razorpay Checkout SDK script
 * https://checkout.razorpay.com/v1/checkout.js
 */
export const loadRazorpayCheckoutScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false)
      return
    }

    if (window.Razorpay) {
      resolve(true)
      return
    }

    // Check if script tag already exists
    const existingScript = document.getElementById('razorpay-checkout-sdk')
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true))
      existingScript.addEventListener('error', () => resolve(false))
      return
    }

    const script = document.createElement('script')
    script.id = 'razorpay-checkout-sdk'
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => resolve(true)
    script.onerror = () => {
      console.warn('Failed to load Razorpay checkout script from CDN.')
      resolve(false)
    }

    document.body.appendChild(script)
  })
}
