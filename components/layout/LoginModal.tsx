import { useState } from 'react'
import { X } from 'lucide-react'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

interface User {
  email: string;
  name?: string;
}

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User) => void;
}

export default function LoginModal({ isOpen, onClose, onLogin }: LoginModalProps) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simula um delay de login/signup
    setTimeout(() => {
      setIsLoading(false)
      onLogin({ email, name })
      onClose()
      // Reset form
      setEmail('')
      setPassword('')
      setName('')
      setIsSignUp(false)
    }, 1500)
  }

  const toggleMode = () => {
    setIsSignUp(!isSignUp)
    setEmail('')
    setPassword('')
    setName('')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md relative">
        {/* Botão de fechar */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X className="h-6 w-6" />
        </button>

                 {/* Cabeçalho */}
         <div className="p-6 pb-0">
           <h2 className="text-2xl font-bold text-gray-900 mb-2">
             {isSignUp ? 'Create Account' : 'Login'}
           </h2>
           <p className="text-gray-600 mb-6">
             {isSignUp 
               ? 'Sign up to start shopping our premium fragrances'
               : 'Sign in to access your account and manage your orders'
             }
           </p>
         </div>

         {/* Formulário */}
         <form onSubmit={handleSubmit} className="p-6 pt-2">
           <div className="space-y-4">
             {isSignUp && (
               <div>
                 <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                   Name
                 </label>
                 <input
                   type="text"
                   id="name"
                   value={name}
                   onChange={(e) => setName(e.target.value)}
                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tps-magenta focus:border-transparent"
                   placeholder="Enter your name"
                   required
                 />
               </div>
             )}

             <div>
               <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                 Email
               </label>
               <input
                 type="email"
                 id="email"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tps-magenta focus:border-transparent"
                 placeholder="Enter your email"
                 required
               />
             </div>

             <div>
               <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                 Password
               </label>
               <input
                 type="password"
                 id="password"
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tps-magenta focus:border-transparent"
                 placeholder={isSignUp ? 'Create a password' : 'Enter your password'}
                 required
               />
             </div>

             {!isSignUp && (
               <div className="flex items-center justify-between">
                 <div className="flex items-center">
                   <input
                     type="checkbox"
                     id="remember"
                     className="h-4 w-4 text-tps-magenta border-gray-300 rounded focus:ring-tps-magenta"
                   />
                   <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                     Remember me
                   </label>
                 </div>

                 <a href="#" className="text-sm font-medium text-tps-magenta hover:text-tps-magenta-dark">
                   Forgot password?
                 </a>
               </div>
             )}

             <button
               type="submit"
               disabled={isLoading}
               className="w-full bg-tps-magenta text-white py-2 px-4 rounded-lg font-medium
                        hover:bg-tps-magenta-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tps-magenta
                        disabled:opacity-50 disabled:cursor-not-allowed"
             >
               {isLoading 
                 ? (isSignUp ? 'Creating account...' : 'Signing in...') 
                 : (isSignUp ? 'Create Account' : 'Sign In')
               }
             </button>
           </div>

           <div className="mt-6 text-center">
             <p className="text-sm text-gray-600">
               {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
               <button 
                 type="button"
                 onClick={toggleMode}
                 className="font-medium text-tps-magenta hover:text-tps-magenta-dark"
               >
                 {isSignUp ? 'Sign in' : 'Sign up'}
               </button>
             </p>
           </div>
         </form>
      </div>
    </div>
  )
}
