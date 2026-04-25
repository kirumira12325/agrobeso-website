import type { Config } from 'tailwindcss';

export default {
    content: ['./index.html', './src/**/*.{ts,tsx}'],
    theme: {
          extend: {
                  colors: {
                            brand: {
                                        // Legacy tokens kept for backward compatibility
                              green: '#3B5D43',
                                        terracotta: '#B8593A',
                                        cream: '#F4EFE6',
                                        charcoal: '#1F1410',
                                        gold: '#C8924A',
                                        // New premium palette
                                        bone: '#F4EFE6',
                                        shell: '#EBE3D4',
                                        clay: '#B8593A',
                                        ochre: '#D4A574',
                                        cocoa: '#1F1410',
                                        ink: '#2A1810',
                                        moss: '#3B5D43'
                            }
                  },
                  fontFamily: {
                            display: ['"Fraunces"', '"GT Sectra"', '"Playfair Display"', 'serif'],
                            sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
                            mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace']
                  },
                  letterSpacing: {
                            tightest: '-0.04em',
                            wider2: '0.18em',
                            widest2: '0.28em'
                  },
                  boxShadow: {
                            soft: '0 16px 40px -20px rgba(31, 20, 16, 0.35)',
                            edge: '0 1px 0 0 rgba(31, 20, 16, 0.08)'
                  },
                  keyframes: {
                            rise: {
                                        '0%': { opacity: '0', transform: 'translateY(20px)' },
                                        '100%': { opacity: '1', transform: 'translateY(0)' }
                            },
                            fadeIn: {
                                        '0%': { opacity: '0' },
                                        '100%': { opacity: '1' }
                            },
                            kenburns: {
                                        '0%': { transform: 'scale(1)' },
                                        '100%': { transform: 'scale(1.06)' }
                            }
                  },
                  animation: {
                            rise: 'rise 800ms cubic-bezier(0.2, 0.8, 0.2, 1) both',
                            fadeIn: 'fadeIn 1.2s ease both',
                            kenburns: 'kenburns 14s ease-out forwards'
                  }
          }
    },
    plugins: []
} satisfies Config;
