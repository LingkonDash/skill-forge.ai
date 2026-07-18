import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface text-muted transition-colors mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="md:col-span-2 flex flex-col gap-3">
            <Link
              href="/"
              className="text-display-md font-bold text-text hover:text-primary transition-colors"
            >
              SkillForge
            </Link>
            <p className="text-body-sm max-w-sm">
              AI-powered personalized learning roadmaps. Tailor your learning
              path, track your progress, and get contextual help from an AI
              Career Coach.
            </p>
          </div>

          {/* Links: Platform */}
          <div>
            <h3 className="text-display-xs font-semibold text-text mb-3">Platform</h3>
            <ul className="space-y-2 text-body-sm">
              <li>
                <Link href="/explore" className="hover:text-primary transition-colors">
                  Explore Roadmaps
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-primary transition-colors">
                  Your Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Links: Company */}
          <div>
            <h3 className="text-display-xs font-semibold text-text mb-3">Company</h3>
            <ul className="space-y-2 text-body-sm">
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright section */}
        <div className="border-t border-border mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-body-xs gap-4">
          <p>© {new Date().getFullYear()} SkillForge AI. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-primary transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
