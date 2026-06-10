import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Globe, Linkedin, Facebook } from "lucide-react";
import {
  COMPANY_NAME,
  COMPANY_NAME_SHORT,
  CONTACT_EMAIL,
  CONTACT_PHONE_DISPLAY,
  CONTACT_PHONE_TEL,
  WEBSITE_DOMAIN,
  OFFICE_ADDRESS,
  LINKEDIN_URL,
  FACEBOOK_URL,
} from "../../lib/branding";
import { subscribeNewsletter } from "../../lib/newsletterService";
import toast from "react-hot-toast";

export function MarketingFooter() {
  return (
    <footer className="border-t border-primary-800 bg-primary-950 text-primary-200">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="text-lg font-bold text-white">{COMPANY_NAME_SHORT}</h3>
            <p className="mt-3 text-sm text-primary-300/90">
              FSC-licensed insurance broker in Mauritius. Motor, home, life, health, travel, and business cover.
            </p>
            <form
              className="mt-6 flex flex-col gap-2 sm:flex-row"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const email = String(fd.get("email") ?? "").trim();
                if (!email) return;
                void subscribeNewsletter(email, "marketing_footer").then((r) => {
                  if (r.ok) toast.success(r.message);
                  else toast.error(r.message);
                });
              }}
            >
              <label htmlFor="marketing-newsletter-email" className="sr-only">
                Email for newsletter
              </label>
              <input
                id="marketing-newsletter-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@company.com"
                className="min-h-[44px] w-full flex-1 rounded-lg border border-primary-700/80 bg-primary-900/40 px-3 py-2 text-sm text-white placeholder:text-primary-400/80 focus:border-accent-400 focus:outline-none"
              />
              <button type="submit" className="min-h-[44px] shrink-0 rounded-lg bg-accent-600 px-4 text-sm font-bold text-white hover:bg-accent-500">
                Subscribe
              </button>
            </form>
            <div className="mt-4 flex gap-2">
              <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-primary-700/80 text-primary-100 hover:border-accent-500/60" aria-label="LinkedIn">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-primary-700/80 text-primary-100 hover:border-accent-500/60" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Explore</h4>
            <div className="mt-4 space-y-2 text-sm">
              <Link to="/products" className="block hover:text-white">Products</Link>
              <Link to="/compare" className="block hover:text-white">Compare cover</Link>
              <Link to="/claims-guide" className="block hover:text-white">Claims guide</Link>
              <Link to="/checklists" className="block hover:text-white">Document checklists</Link>
              <Link to="/blog" className="block hover:text-white">Insights</Link>
              <Link to="/about" className="block hover:text-white">About us</Link>
              <Link to="/#quote" className="block hover:text-white">Get a quote</Link>
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
                <MapPin className="h-4 w-4 shrink-0 mt-0.5" /> {OFFICE_ADDRESS}
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 shrink-0" /> {WEBSITE_DOMAIN}
              </div>
            </div>
          </div>
        </div>
        <p className="mt-12 border-t border-primary-800 pt-8 text-center text-xs text-primary-400">
          &copy; {new Date().getFullYear()} {COMPANY_NAME}. All rights reserved. Licensed Insurance Broker — Mauritius FSC.
        </p>
      </div>
    </footer>
  );
}
