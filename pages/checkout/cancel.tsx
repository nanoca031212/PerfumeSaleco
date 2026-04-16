import Link from 'next/link'
import { XCircle } from 'lucide-react'

export default function CheckoutCancel() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center">
        <XCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
        
        <h1 className="text-2xl font-bold mb-2">Payment Canceled</h1>
        <p className="text-gray-600 mb-6">
          Your payment was canceled. No charges were made.
        </p>
        
        <div className="space-y-4">
          <Link href="/" className="block w-full bg-black text-white py-3 rounded-full font-medium hover:bg-gray-900">
            Return to Store
          </Link>
        </div>
      </div>
    </div>
  )
}