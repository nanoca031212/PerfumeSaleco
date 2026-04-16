import Link from 'next/link'
import Layout from '@/components/layout/Layout'

export default function Custom404() {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">Page Not Found</h2>
        <p className="text-gray-600 mb-8 max-w-md">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link 
          href="/" 
          className="bg-black text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </Layout>
  )
}
