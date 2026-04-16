import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react'
import { useCart } from '../contexts/CartContext'

interface ProcessingStatus {
  stripe_data: 'loading' | 'success' | 'error';
  shopify_order: 'loading' | 'success' | 'error';
  utm_tracking: 'loading' | 'success' | 'error';
}

export default function Return() {
  const router = useRouter()
  const { clearCart } = useCart()
  const { session_id } = router.query
  const [processing, setProcessing] = useState(false)
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>({
    stripe_data: 'loading',
    shopify_order: 'loading',
    utm_tracking: 'loading'
  })
  const [orderDetails, setOrderDetails] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [hasProcessed, setHasProcessed] = useState(false)

  useEffect(() => {
    // Clear cart and process order when session_id is available
    if (session_id && typeof session_id === 'string' && !hasProcessed) {
      clearCart()
      processOrder(session_id)
      setHasProcessed(true)
    }
  }, [session_id, hasProcessed])

  const processOrder = async (sessionId: string) => {
    setProcessing(true)
    setError(null)

    try {
      // 1. Fetch Stripe session data
      console.log('🔍 Fetching Stripe session data:', sessionId)
      setProcessingStatus(prev => ({ ...prev, stripe_data: 'loading' }))
      
      const stripeResponse = await fetch(`/api/stripe/session-details?session_id=${sessionId}`)
      
      if (!stripeResponse.ok) {
        throw new Error('Failed to fetch Stripe session data')
      }
      
      const stripeData = await stripeResponse.json()
      setOrderDetails(stripeData.data)
      setProcessingStatus(prev => ({ ...prev, stripe_data: 'success' }))
      
      console.log('✅ Stripe data retrieved:', stripeData.data)

      // 2. Send order to Shopify
      console.log('📦 Sending order to Shopify...')
      setProcessingStatus(prev => ({ ...prev, shopify_order: 'loading' }))
      
      const shopifyResponse = await fetch('/api/shopify/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderData: stripeData.data }),
      })

      if (shopifyResponse.ok) {
        const shopifyData = await shopifyResponse.json()
        console.log('✅ Order created in Shopify:', shopifyData)
        setProcessingStatus(prev => ({ ...prev, shopify_order: 'success' }))
      } else {
        console.warn('⚠️ Failed to create order in Shopify (continuing...)')
        setProcessingStatus(prev => ({ ...prev, shopify_order: 'error' }))
      }

      // 3. Process UTM tracking and send to UTMfy
      setProcessingStatus(prev => ({ ...prev, utm_tracking: 'loading' }))
      
      try {
        // Send data to UTMfy using Stripe session
        const utmfyResponse = await fetch('/api/utmfy/send-conversion', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId: session_id,
            sessionData: stripeData.data
          }),
        })

        if (utmfyResponse.ok) {
          const utmfyResult = await utmfyResponse.json()
          console.log('✅ Conversion sent to UTMfy successfully:', utmfyResult)
          setProcessingStatus(prev => ({ ...prev, utm_tracking: 'success' }))
        } else {
          const errorText = await utmfyResponse.text()
          console.warn('⚠️ Failed to send conversion to UTMfy:', errorText)
          setProcessingStatus(prev => ({ ...prev, utm_tracking: 'error' }))
        }
      } catch (utmfyError) {
        console.error('❌ Error sending to UTMfy:', utmfyError)
        setProcessingStatus(prev => ({ ...prev, utm_tracking: 'error' }))
      }

    } catch (error: any) {
      console.error('❌ Error processing order:', error)
      setError(error.message)
      setProcessingStatus({
        stripe_data: 'error',
        shopify_order: 'error',
        utm_tracking: 'error'
      })
    } finally {
      setProcessing(false)
    }
  }

  const getStatusIcon = (status: 'loading' | 'success' | 'error') => {
    switch (status) {
      case 'loading':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />
    }
  }

  const getStatusText = (status: 'loading' | 'success' | 'error') => {
    switch (status) {
      case 'loading':
        return 'Processing...'
      case 'success':
        return 'Completed'
      case 'error':
        return 'Error'
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center">
        <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
        
        <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-6">
          Thank you for your order! A confirmation email will be sent to {orderDetails?.customer?.email || 'test@example.com'}.
        </p>
        
        {session_id && (
          <div className="bg-gray-50 p-4 rounded-md mb-6">
            <p className="text-sm text-gray-500">Transaction ID:</p>
            <p className="text-xs font-mono break-all">{session_id}</p>
          </div>
        )}

        {/* Processing status */}
        {processing || Object.values(processingStatus).some(status => status === 'loading') ? (
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-md mb-6">
            <h3 className="text-sm font-medium text-blue-800 mb-3">Processing your order...</h3>
            <div className="space-y-2 text-left">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700">Stripe Data</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(processingStatus.stripe_data)}
                  <span className="text-xs text-blue-600">{getStatusText(processingStatus.stripe_data)}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700">Shopify Creation</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(processingStatus.shopify_order)}
                  <span className="text-xs text-blue-600">{getStatusText(processingStatus.shopify_order)}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700">UTM Tracking</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(processingStatus.utm_tracking)}
                  <span className="text-xs text-blue-600">{getStatusText(processingStatus.utm_tracking)}</span>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Order details */}
        {orderDetails && (
          <div className="bg-green-50 border border-green-200 p-4 rounded-md mb-6 text-left">
            <h3 className="text-sm font-medium text-green-800 mb-3">Order Details</h3>
            <div className="space-y-1 text-xs text-green-700">
              <div>Email: {orderDetails.customer.email}</div>
              <div>Total: {orderDetails.currency.toUpperCase()} {(orderDetails.amount_total / 100).toFixed(2)}</div>
              <div>Items: {orderDetails.line_items.length}</div>
              {orderDetails.utm_params.utm_source && (
                <div>UTM Source: {orderDetails.utm_params.utm_source}</div>
              )}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-md mb-6">
            <h3 className="text-sm font-medium text-red-800 mb-2">Processing Error</h3>
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}
        
        <div className="space-y-4">
          <Link href="/" className="block w-full bg-black text-white py-3 rounded-full font-medium hover:bg-gray-900">
            Back to Shop
          </Link>
          
          <Link href="/collections/mens" className="block w-full bg-white text-black border border-black py-3 rounded-full font-medium hover:bg-gray-50">
            View More Perfumes
          </Link>
        </div>
      </div>
    </div>
  )
}