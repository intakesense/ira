'use client'

import { useState, useEffect } from 'react'
import { Menu, X, ChevronDown, Globe, Building2, LogIn } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { colors as themeColors } from '@/lib/theme/colors'

export const Header = () => {
  const pathname = usePathname()
  const router = useRouter()
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    if (pathname !== '/') {
      router.push('/')
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    }
    setMobileMenuOpen(false)
  }

  const pagesWithHero = ['/', '/methodology', '/privacy-policy', '/terms-of-service', '/sme-exchange-rules']
  const hasHeroSection = pagesWithHero.includes(pathname)
  const showSolidBg = isScrolled || !hasHeroSection

  return (
    <header
      className="fixed w-full z-40 transition-all duration-300"
      style={{
        background: showSolidBg ? `${themeColors.white}E6` : 'transparent',
        backdropFilter: showSolidBg ? 'blur(8px)' : undefined,
        borderBottom: showSolidBg ? `1px solid ${themeColors.blue[100]}` : 'none',
        boxShadow: showSolidBg ? '0 4px 12px rgba(0,0,0,0.08)' : 'none',
        padding: showSolidBg ? '12px 0' : '20px 0',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">

          {/* LOGO */}
          <Link href="/" className="flex items-center">
            <span
              className="text-2xl font-serif font-bold"
              style={{ color: showSolidBg ? themeColors.brand[900] : themeColors.white }}
            >
              IRA
              <span style={{ color: themeColors.amber[500] }}>Score</span>
            </span>
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden md:flex items-center space-x-8">

            {/* DROPDOWN */}
            <div className="relative group">
              <button
                className="flex items-center text-sm font-medium transition-colors"
                style={{
                  color: showSolidBg ? themeColors.brand[800] : themeColors.white,
                }}
              >
                Stock Exchanges <ChevronDown className="ml-1 w-4 h-4" />
              </button>

              <div
                className="absolute left-0 mt-2 w-80 rounded-xl shadow-xl hidden group-hover:block"
                style={{
                  background: themeColors.white,
                  border: `1px solid ${themeColors.blue[100]}`,
                }}
              >
                <div
                  className="p-4 border-b"
                  style={{ background: themeColors.blue[100], borderColor: themeColors.blue[200] }}
                >
                  <div className="flex items-center font-bold mb-2" style={{ color: themeColors.brand[900] }}>
                    <Building2 className="w-4 h-4 mr-2" color={themeColors.amber[500]} />
                    INDIA
                  </div>
                  <ul className="space-y-1 pl-6">
                    {['BSE', 'NSE', 'BSE SME', 'NSE Emerge'].map(item => (
                      <li
                        key={item}
                        className="text-sm cursor-pointer"
                        style={{ color: themeColors.brand[800] }}
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4">
                  <div className="flex items-center font-bold mb-2" style={{ color: themeColors.brand[900] }}>
                    <Globe className="w-4 h-4 mr-2" color={themeColors.amber[500]} />
                    GLOBAL
                  </div>
                  <ul className="space-y-1 pl-6">
                    {['NASDAQ', 'NYSE', 'LSE'].map(item => (
                      <li
                        key={item}
                        className="text-sm cursor-pointer"
                        style={{ color: themeColors.brand[800] }}
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {[
              ['how-it-works', 'How it Works'],
              ['success-stories', 'Success Stories'],
              ['contact', 'Contact'],
            ].map(([id, label]) => (
              <button
                key={id}
                onClick={() => scrollToSection(id)}
                className="text-sm font-medium transition-colors"
                style={{
                  color: showSolidBg ? themeColors.brand[800] : themeColors.white,
                }}
              >
                {label}
              </button>
            ))}

            {/* LOGIN */}
            <Link
              href="/login"
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all"
              style={{
                background: themeColors.amber[500],
                color: themeColors.white,
              }}
            >
              <LogIn className="w-4 h-4" />
              Login
            </Link>
          </nav>

          {/* MOBILE ICON */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden"
            style={{ color: showSolidBg ? themeColors.brand[900] : themeColors.white }}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div
          className="md:hidden px-6 py-5 space-y-4 shadow-lg"
          style={{
            background: themeColors.white,
            borderTop: `1px solid ${themeColors.blue[100]}`,
          }}
        >
          <div className="font-bold border-b pb-2" style={{ color: themeColors.brand[900] }}>
            Stock Exchanges
          </div>

          <div className="pl-4 space-y-2">
            <div className="text-xs font-bold" style={{ color: themeColors.gray[500] }}>INDIA</div>
            <div style={{ color: themeColors.brand[800] }}>BSE / NSE / SME</div>

            <div className="text-xs font-bold mt-2" style={{ color: themeColors.gray[500] }}>GLOBAL</div>
            <div style={{ color: themeColors.brand[800] }}>NASDAQ / NYSE</div>
          </div>

          {[
            ['how-it-works', 'How it Works'],
            ['success-stories', 'Success Stories'],
            ['contact', 'Contact'],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => scrollToSection(id)}
              className="block w-full text-left font-medium py-2"
              style={{ color: themeColors.brand[800] }}
            >
              {label}
            </button>
          ))}

          <Link
            href="/login"
            className="flex items-center justify-center gap-2 mt-4 px-8 py-4 rounded-lg font-semibold transition-all"
            style={{
              background: themeColors.amber[500],
              color: themeColors.white,
            }}
            onClick={() => setMobileMenuOpen(false)}
          >
            <LogIn className="w-5 h-5" />
            Login
          </Link>
        </div>
      )}
    </header>
  )
}
