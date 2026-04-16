'use client';

import { useState } from 'react';
import stripeVariantMapping from '../data/stripe_variant_mapping.json';

interface TestResult {
  handle: string;
  variantId: string;
  url: string;
  status: number | string;
  working: boolean;
  error?: string;
  location?: string;
}

export default function CartUrlTester() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  // Get first 20 products for testing
  const availableProducts = Object.keys(stripeVariantMapping as Record<string, string>).slice(0, 20);

  const testSelectedUrls = async () => {
    if (selectedProducts.length === 0) {
      alert('Please select at least one product to test');
      return;
    }

    setIsLoading(true);
    const results: TestResult[] = [];

    for (const handle of selectedProducts) {
      const variantId = (stripeVariantMapping as Record<string, string>)[handle];
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';
      const url = `${siteUrl}/cart/${variantId}:1`;
      
      try {
        const response = await fetch(url, { method: 'HEAD' });
        results.push({
          handle,
          variantId,
          url,
          status: response.status,
          working: response.status === 302 || response.status === 200,
          location: response.headers.get('location') || undefined
        });
      } catch (error) {
        results.push({
          handle,
          variantId,
          url,
          status: 'Error',
          working: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    setTestResults(results);
    setIsLoading(false);
  };

  const testAllUrls = async () => {
    setIsLoading(true);
    const results: TestResult[] = [];

    for (const handle of availableProducts) {
      const variantId = (stripeVariantMapping as Record<string, string>)[handle];
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      const url = `${siteUrl}/cart/${variantId}:1`;
      
      try {
        const response = await fetch(url, { method: 'HEAD' });
        results.push({
          handle,
          variantId,
          url,
          status: response.status,
          working: response.status === 302 || response.status === 200,
          location: response.headers.get('location') || undefined
        });
      } catch (error) {
        results.push({
          handle,
          variantId,
          url,
          status: 'Error',
          working: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    setTestResults(results);
    setIsLoading(false);
  };

  const openUrl = (url: string) => {
    window.open(url, '_blank');
  };

  const toggleProductSelection = (handle: string) => {
    setSelectedProducts(prev => 
      prev.includes(handle) 
        ? prev.filter(h => h !== handle)
        : [...prev, handle]
    );
  };

  const selectAll = () => {
    setSelectedProducts(availableProducts);
  };

  const clearSelection = () => {
    setSelectedProducts([]);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">🧪 Cart URL Tester</h1>
        
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h2 className="font-bold text-blue-800 mb-2">📋 Instructions</h2>
          <p className="text-blue-700 mb-2">
            This tool tests Shopify cart URLs to verify they work correctly.
          </p>
          <ul className="list-disc list-inside text-blue-700 space-y-1">
            <li>Select products to test or test all available products</li>
            <li>Click "Test Selected URLs" or "Test All URLs"</li>
            <li>Green results indicate working URLs (status 200 or 302)</li>
            <li>Red results indicate broken URLs or errors</li>
          </ul>
        </div>

        {/* Product Selection */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">Select Products to Test</h3>
            <div className="space-x-2">
              <button
                onClick={selectAll}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Select All
              </button>
              <button
                onClick={clearSelection}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Clear All
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-60 overflow-y-auto border rounded p-4">
            {availableProducts.map((handle) => (
              <label key={handle} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedProducts.includes(handle)}
                  onChange={() => toggleProductSelection(handle)}
                  className="rounded"
                />
                <span className="text-sm truncate">{handle}</span>
              </label>
            ))}
          </div>
          
          <p className="text-sm text-gray-600 mt-2">
            Selected: {selectedProducts.length} / {availableProducts.length}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mb-6 flex flex-wrap gap-4">
          <button
            onClick={testSelectedUrls}
            disabled={isLoading || selectedProducts.length === 0}
            className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '🔄 Testing...' : `🧪 Test Selected URLs (${selectedProducts.length})`}
          </button>
          
          <button
            onClick={testAllUrls}
            disabled={isLoading}
            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
          >
            {isLoading ? '🔄 Testing...' : `🧪 Test All URLs (${availableProducts.length})`}
          </button>
        </div>

        {/* Results */}
        {testResults.length > 0 && (
          <div>
            <h3 className="font-bold text-lg mb-4">📊 Test Results</h3>
            
            {/* Summary */}
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {testResults.filter(r => r.working).length}
                  </div>
                  <div className="text-sm text-gray-600">Working</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {testResults.filter(r => !r.working).length}
                  </div>
                  <div className="text-sm text-gray-600">Broken</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {testResults.length}
                  </div>
                  <div className="text-sm text-gray-600">Total</div>
                </div>
              </div>
            </div>

            {/* Detailed Results */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {testResults.map((result, index) => (
                <div 
                  key={index} 
                  className={`p-4 rounded-lg border ${
                    result.working 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium mb-1">
                        {result.working ? '✅' : '❌'} {result.handle}
                      </div>
                      <div className="text-sm text-gray-600 mb-1">
                        <strong>Variant ID:</strong> <code>{result.variantId}</code>
                      </div>
                      <div className="text-sm text-gray-600 mb-1">
                        <strong>Status:</strong> {result.status}
                      </div>
                      {result.location && (
                        <div className="text-sm text-gray-600 mb-1">
                          <strong>Redirects to:</strong> <code className="break-all">{result.location}</code>
                        </div>
                      )}
                      {result.error && (
                        <div className="text-sm text-red-600">
                          <strong>Error:</strong> {result.error}
                        </div>
                      )}
                      <div className="text-xs text-gray-500 break-all">
                        {result.url}
                      </div>
                    </div>
                    <div className="ml-4 space-y-2">
                      <button
                        onClick={() => openUrl(result.url)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        Open URL
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}