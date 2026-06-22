import { Link } from "react-router";
import { Phone, Mail, MapPin, Globe } from "lucide-react";
import {
  COMPANY_NAME,
  COMPANY_NAME_SHORT,
  CONTACT_EMAIL,
  CONTACT_PHONE_DISPLAY,
  CONTACT_PHONE_TEL,
  WEBSITE_DOMAIN,
  OFFICE_ADDRESS,
} from "~/lib/branding";

export function MarketingFooter() {
  return (
    <footer className="border-t border-blue-800 bg-blue-950 text-blue-200">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="text-lg font-bold text-white">{COMPANY_NAME_SHORT}</h3>
            <p className="mt-3 text-sm text-blue-300/90">
              FSC-licensed insurance broker in Mauritius. Motor, home, life, health, travel, and business cover.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Explore</h4>
            <div className="mt-4 space-y-2 text-sm">
              <Link to="/products" className="block hover:text-white">Products</Link>
              <Link to="/compare" className="block hover:text-white">Compare cover</Link>
              <Link to="/claims-guide" className="block hover:text-white">Claims guide</Link>
              <Link to="/checklists" className="block hover:text-white">Checklists</Link>
              <Link to="/blog" className="block hover:text-white">Insights</Link>
              <Link to="/about" className="block hover:text-white">About us</Link>
              <Link to="/login" className="block hover:text-white">Sign in</Link>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Legal</h4>
            <div className="mt-4 space-y-2 text-sm">
              <Link to="/privacy" className="block hover:text-white">Privacy policy</Link>
              <Link to="/terms" className="block hover:text-white">Terms of use</Link>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Contact</h4>
            <div className="mt-4 space-y-2 text-sm">
              <a href={`tel:${CONTACT_PHONE_TEL}`} className="flex items-center gap-2 hover:text-white">
                <Phone className="h-4 w-4 shrink-0" /> {CONTACT_PHONE_DISPLAY}
              </a>
              <a href={`mailto:${CONTACT_EMAIL}`} className="flex items-center gap-2 hover:text-white">
                <Mail className="h-4 w-4 shrink-0" /> {CONTACT_EMAIL}
              </a>
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" /> {OFFICE_ADDRESS}
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 shrink-0" /> {WEBSITE_DOMAIN}
              </div>
            </div>
          </div>
        </div>
        <p className="mt-12 border-t border-blue-800 pt-8 text-center text-xs text-blue-400">
          &copy; {new Date().getFullYear()} {COMPANY_NAME}. All rights reserved. Licensed Insurance Broker — Mauritius FSC.
        </p>
      </div>
    </footer>
  );
}
