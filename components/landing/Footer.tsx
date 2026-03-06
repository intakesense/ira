'use client';

import { Mail, MapPin, User } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { colors as themeColors } from '@/lib/theme/colors';

export const Footer = () => {
  const router = useRouter();
  const pathname = usePathname();

  const scrollToSection = (id: string) => {
    if (pathname !== '/') {
      router.push('/');
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 120);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer
      className="relative text-white"
      style={{
        background: `linear-gradient(180deg, ${themeColors.brand[950]}, ${themeColors.brand[900]})`,
      }}
    >
      {/* SUBTLE BACKGROUND ACCENT */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 right-0 w-96 h-96 blur-3xl"
          style={{ background: themeColors.blue[700], opacity: 0.15 }}
        />
      </div>

      {/* MAIN FOOTER */}
      <div className="relative max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 items-start">
          
          {/* BRAND */}
          <div>
            <h3
              className="text-3xl font-serif font-bold tracking-wide"
              style={{ color: themeColors.white }}
            >
              IRA<span style={{ color: themeColors.amber[500] }}>Score</span>
            </h3>

            <p
              className="mt-4 max-w-sm text-sm leading-relaxed"
              style={{ color: themeColors.blue[200] }}
            >
              Strategic IPO readiness and SME listing advisory for Indian
              companies. From eligibility to exchange listing — end to end.
            </p>
          </div>

          {/* LINKS */}
          <div>
            <h4
              className="text-sm font-semibold uppercase tracking-wide mb-5"
              style={{ color: themeColors.amber[500] }}
            >
              Explore
            </h4>

            <ul className="space-y-3 text-sm" style={{ color: themeColors.blue[200]  }}>
              <li>
                <Link href="/" className="hover:text-amber-500 transition">
                  Eligibility Check
                </Link>
              </li>
              <li>
                <Link href="/methodology" className="hover:text-amber-500 transition">
                  Our Methodology
                </Link>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('success-stories')}
                  className="hover:text-amber-500 transition"
                >
                  Client Stories
                </button>
              </li>
              <li>
                <Link href="/sme-exchange-rules" className="hover:text-amber-500 transition">
                  SME Exchange Rules
                </Link>
              </li>
            </ul>
          </div>

          {/* CONTACT */}
          <div>
            <h4
              className="text-sm font-semibold uppercase tracking-wide mb-5"
              style={{ color: themeColors.amber[500] }}
            >
              Contact
            </h4>

            <div
              className="rounded-xl p-5 border"
              style={{
                borderColor: themeColors.brand[800],
                background: `linear-gradient(
                  180deg,
                  rgba(8,45,107,0.45),
                  rgba(8,45,107,0.25)
                )`,
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="h-10 w-10 rounded-full flex items-center justify-center"
                  style={{
                    background: themeColors.brand[800],
                    border: `1px solid ${themeColors.amber[500]}`,
                  }}
                >
                  <User size={16} color={themeColors.amber[500]} />
                </div>

                <div>
                  <p className="text-sm font-semibold">Piyush Kumar</p>
                  <p className="text-xs uppercase tracking-wide text-blue-200">
                    IPO Advisor
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <a
                  href="mailto:piyush@cosmosfin.com"
                  className="flex items-center gap-2 hover:text-amber-500 transition"
                >
                  <Mail size={14} color={themeColors.amber[500]} />
                  piyush@cosmosfin.com
                </a>

                <div className="flex items-start gap-2">
                  <MapPin size={14} color={themeColors.amber[500]} />
                  <span className="text-blue-200">
                    C-756 NFC,<br />
                    New Delhi – 110025
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER BAR */}
      <div
        className="border-t"
        style={{ borderColor: themeColors.brand[800] }}
      >
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <p>
            © {new Date().getFullYear()} IRA Score Financial Services
          </p>

          <div className="flex gap-6">
            <Link href="/privacy-policy" className="hover:text-amber-500">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="hover:text-amber-500">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
