import '@/styles/globals.css'
import '@/styles/stripe-checkout.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { CartProvider } from '@/contexts/CartContext'
import AppLayout from '@/components/layout/AppLayout'
import { usePixel } from '@/hooks/usePixel'
import { useUTM } from '@/hooks/useUTM'
import { useRouter } from 'next/router'

export default function App({ Component, pageProps }: AppProps) {
  // Inicializa o rastreamento de página
  usePixel(true);
  
  // Inicializa o rastreamento de UTMs em todas as páginas
  useUTM();
  
  const router = useRouter()
  const isQuizPage = router.pathname === '/quiz'
  const isCheckoutPage = router.pathname.startsWith('/checkout')

  return (
    <CartProvider>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        <meta name="theme-color" content="#ee7d1b" />
        <link rel="icon" href="/images/logo.avif" />
      </Head>
      <AppLayout hideBottomNavigation={isQuizPage || isCheckoutPage}>
        <Component {...pageProps} />
      </AppLayout>
    </CartProvider>
  )
}