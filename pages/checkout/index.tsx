import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import { useCart } from '@/contexts/CartContext';
import { useUTM } from '@/hooks/useUTM';
import { usePixel } from '@/hooks/usePixel';
import Head from 'next/head';
import { useRouter } from 'next/router';
import HeaderTPS from '@/components/layout/HeaderTPS';
import FooterTPS from '@/components/layout/FooterTPS';

// Make sure to call loadStripe outside of a component’s render to avoid
// recreating the Stripe object on every render.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string);

export default function CheckoutPage() {
    const { items, total } = useCart();
    const { utmParams } = useUTM();
    const pixel = usePixel();
    const [clientSecret, setClientSecret] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState<'contact' | 'payment'>('contact');
    const [contactForm, setContactForm] = useState({
        email: '',
        firstName: '',
        lastName: '',
        phone: ''
    });
    const router = useRouter();

    useEffect(() => {
        // Create a Checkout Session only when step is payment
        if (items.length > 0 && !clientSecret && !loading && step === 'payment') {
            setLoading(true);
            fetch("/api/stripe/create-checkout", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    items: items.map(item => ({
                        stripeId: item.stripeId,
                        quantity: item.quantity,
                        title: item.title,
                        image: item.image,
                        price: item.price,
                        handle: item.handle
                    })),
                    utmParams: utmParams, // Send all UTMs
                    customerEmail: contactForm.email || undefined
                }),
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.clientSecret) {
                        setClientSecret(data.clientSecret);
                    } else if (data.error) {
                        setError(data.error);
                        console.error("Error creating checkout session:", data);
                    }
                })
                .catch(err => {
                    setError("Failed to initialize checkout");
                    console.error(err);
                })
                .finally(() => setLoading(false));
        }
    }, [items, utmParams, step]);

    const handleContactSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Atualizar dados do usuário no Pixel (Advanced Matching)
        pixel.setUserData({
            em: contactForm.email,
            fn: contactForm.firstName,
            ln: contactForm.lastName,
            ph: contactForm.phone
        });

        // Rastrear InitiateCheckout com dados enriquecidos
        pixel.initiateCheckout({
            value: total,
            currency: 'GBP',
            content_ids: items.map(item => item.id.toString()),
            num_items: items.length,
            content_type: 'product',
            // Dados do usuário para UTMify e outros pixels que suportam enrichment no evento
            email: contactForm.email,
            phone: contactForm.phone,
            first_name: contactForm.firstName,
            last_name: contactForm.lastName
        });

        setStep('payment');
    };

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Head>
                    <title>Empty Basket | Perfumes UK</title>
                </Head>
                <HeaderTPS sticky={true} />
                <div className="flex-grow flex items-center justify-center py-40">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">
                            Your basket is empty
                        </h1>
                        <p className="text-gray-600 mb-8 px-2">
                            Add some products to your basket to continue with checkout.
                        </p>
                        <a
                            href="/"
                            className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors"
                        >
                            Back to shop
                        </a>
                    </div>
                </div>
                <FooterTPS />
            </div>
        );
    }

    return (
        <div id="checkout" className="min-h-screen bg-gray-50">
            <Head>
                <title>Checkout | Perfumes UK</title>
            </Head>

            <HeaderTPS />

            <div className="max-w-4xl mx-auto">
                {/* Order Summary */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                    <div className="space-y-4">
                        {items.map((item) => (
                            <div key={item.id} className="flex items-center space-x-4 border-b pb-4 last:border-0 last:pb-0">
                                <div className="relative w-20 h-20 flex-shrink-0">
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-medium text-gray-900">{item.title}</h3>
                                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-gray-900">£{item.price.toFixed(2)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="border-t mt-4 pt-4 flex justify-between items-center">
                        <span className="font-bold text-lg">Total</span>
                        <span className="font-bold text-lg">£{total.toFixed(2)}</span>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        <p>Error: {error}</p>
                        <button onClick={() => router.push('/')} className="underline mt-2">Return to Home</button>
                    </div>
                )}

                {step === 'contact' ? (
                    <div className="bg-white p-6 rounded-lg shadow-sm pb-10">
                        <h2 className="text-xl font-bold mb-6">Contact Information</h2>
                        <form onSubmit={handleContactSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                    <input
                                        type="text"
                                        name="first_name"
                                        required
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-3 border"
                                        placeholder="John"
                                        value={contactForm.firstName}
                                        onChange={e => setContactForm({ ...contactForm, firstName: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                    <input
                                        type="text"
                                        name="last_name"
                                        required
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-3 border"
                                        placeholder="Doe"
                                        value={contactForm.lastName}
                                        onChange={e => setContactForm({ ...contactForm, lastName: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-3 border"
                                    placeholder="john.doe@example.com"
                                    value={contactForm.email}
                                    onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                                />
                                <p className="mt-1 text-xs text-gray-500">We'll use this to send your order confirmation.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    required
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-3 border"
                                    placeholder="+44 7123 456789"
                                    value={contactForm.phone}
                                    onChange={e => setContactForm({ ...contactForm, phone: e.target.value })}
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-black text-white py-4 px-4 rounded-md hover:bg-gray-800 transition-colors font-bold text-lg mt-6 flex justify-center items-center gap-2"
                            >
                                Continue to Payment
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </form>
                    </div>
                ) : (
                    <>
                        {clientSecret ? (
                            <EmbeddedCheckoutProvider
                                stripe={stripePromise}
                                options={{ clientSecret }}
                            >
                                <EmbeddedCheckout />
                            </EmbeddedCheckoutProvider>
                        ) : (
                            <div className="flex flex-col justify-center items-center h-64 bg-white rounded-lg shadow-sm">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mb-4"></div>
                                <p className="text-gray-500 font-medium">Preparing secure checkout...</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
