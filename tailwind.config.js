/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Cores exatas do The Perfume Shop (baseadas no screenshot)
      colors: {
        // Cores principais
        black: '#000000',           // Preto principal
        'gray-strong': '#303030',   // Cinza texto forte  
        'gray-secondary': '#808080', // Cinza secundário
        'gray-border': '#E0E0E0',   // Divisores/bordas
        'gray-bg': '#F8F8F8',       // Fundo página
        'gray-chip': '#F0F0F0',     // Fundo chips/barras claras
        
        // Cores de marca
        'tps-magenta': '#E00034',   // Rosa/magenta da navegação
        'tps-green': '#008060',     // Botão da busca (verde)
        'tps-red': '#E00030',       // Save/Oferta (vermelho/rosa)
        
        // Paleta extendida para compatibilidade
        primary: {
          50: '#fef8f8',
          100: '#fef2f2', 
          200: '#fee2e2',
          300: '#fca5a5',
          400: '#f87171',
          500: '#E00034',  // Magenta principal
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        
        // Cores de estado específicas
        accent: {
          red: '#E00030',     // Save/desconto
          green: '#008060',   // Botão busca/sucesso
          magenta: '#E00034', // Navegação
        },
        
        // Estados funcionais
        success: '#008060',
        warning: '#f59e0b', 
        error: '#E00030',
      },
      
      // Tipografia responsiva
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
      },
      
      // Breakpoints mobile-first
      screens: {
        'xs': '375px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      
      // Espaçamentos para mobile
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      
      // Animações otimizadas
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-light': 'bounce 1s infinite',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      
      // Shadow personalizada
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'strong': '0 10px 40px -10px rgba(0, 0, 0, 0.2)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    // Plugin personalizado para mobile-first
    function({ addUtilities }) {
      addUtilities({
        '.touch-target': {
          'min-height': '44px',
          'min-width': '44px',
        },
        '.safe-area-top': {
          'padding-top': 'env(safe-area-inset-top)',
        },
        '.safe-area-bottom': {
          'padding-bottom': 'env(safe-area-inset-bottom)',
        },
      })
    }
  ],
}
