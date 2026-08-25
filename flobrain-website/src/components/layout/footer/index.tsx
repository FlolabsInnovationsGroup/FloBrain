"use client";

import React, { useId, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, LayoutDashboard, MessageCircle } from "lucide-react";
import FlolabsLogo from "@/assets/images/flolabs-logo.svg";
import {
  FOOTER_BRAND,
  FOOTER_BYLINE,
  FOOTER_COMPANY_LINKS,
  FOOTER_DESCRIPTION,
  FOOTER_MARKETING_PATHS,
  FOOTER_NAVIGATION_LINKS,
  FOOTER_PROJECT_LINKS,
  FOOTER_SOCIAL,
  type FooterLinkItem,
} from "./constants";

const MOBILE_APP_NAV_ITEMS = [
  { label: "Home", href: "/home", icon: House },
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Chats", href: "/brain", icon: MessageCircle },
] as const;

/**
 * Themed through the `--fb-site-footer-*` tokens in globals.css (defined under
 * `.light` / `.dark`). The `dark:` variant is media-query based in this project,
 * so it does not follow the theme toggle and is not used here.
 */
const styles = {
  footer:
    "bg-[var(--fb-site-footer-bg,#0b0b0b)] text-[var(--fb-site-footer-text,#ffffff)]",
  heading:
    "text-[13px] font-bold uppercase tracking-[0.2em] text-[var(--fb-site-footer-text,#ffffff)]",
  link: "text-[15px] text-[var(--fb-site-footer-text,#ffffff)] transition-colors hover:text-[#a855f7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fb-site-footer-focus,#ffffff)]",
  muted: "text-[var(--fb-site-footer-muted,#8a8a8a)]",
  wordmark: "text-[var(--fb-site-footer-text,#ffffff)]",
  divider: "bg-[var(--fb-site-footer-divider,rgba(255,255,255,0.25))]",
  borderDivider: "border-[var(--fb-site-footer-hairline,rgba(255,255,255,0.12))]",
  input:
    "border-[var(--fb-site-footer-input-border,rgba(255,255,255,0.2))] bg-[var(--fb-site-footer-input-bg,transparent)] text-[var(--fb-site-footer-text,#ffffff)] placeholder:text-[var(--fb-site-footer-muted,#8a8a8a)] focus:border-[var(--fb-site-footer-input-border-focus,rgba(255,255,255,0.4))] focus-visible:ring-[var(--fb-site-footer-ring,rgba(255,255,255,0.3))]",
  submit:
    "bg-[var(--fb-site-footer-submit-bg,#1a1a1a)] text-white hover:bg-[var(--fb-site-footer-submit-bg-hover,#252525)] focus-visible:outline-[var(--fb-site-footer-focus,#ffffff)]",
  social:
    "text-[var(--fb-site-footer-text,#ffffff)] hover:text-[#a855f7] focus-visible:outline-[var(--fb-site-footer-focus,#ffffff)]",
  toggleFocus: "focus-visible:outline-[var(--fb-site-footer-focus,#ffffff)]",
};

const SendIcon: React.FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M22 2 11 13" />
    <path d="M22 2 15 22 11 13 2 9 22 2z" />
  </svg>
);

const YouTubeIcon: React.FC = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.4 31.4 0 0 0 0 12a31.4 31.4 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.4 31.4 0 0 0 24 12a31.4 31.4 0 0 0-.5-5.8z" />
    <path
      d="M9.75 15.02 15.5 12 9.75 8.98v6.04z"
      className="fill-[var(--fb-site-footer-yt-play,#0b0b0b)]"
    />
  </svg>
);

const LinkedInIcon: React.FC = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.35-1.85 3.58 0 4.24 2.36 4.24 5.43v6.31zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
  </svg>
);

const FacebookIcon: React.FC = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07c0 6.02 4.39 11.01 10.13 11.91v-8.41H7.08v-3.5h3.05V9.41c0-3.01 1.79-4.67 4.53-4.67 1.31 0 2.68.23 2.68.23v2.95h-1.51c-1.49 0-1.95.92-1.95 1.87v2.25h3.32l-.53 3.5h-2.79v8.41C19.61 23.08 24 18.09 24 12.07z" />
  </svg>
);

const InstagramIcon: React.FC = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.43.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.43.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.73 3.73 0 0 1-1.38-.9 3.73 3.73 0 0 1-.9-1.38c-.16-.43-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.43-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zm0-2.16C8.74 0 8.33.01 7.05.07 5.78.13 4.9.34 4.14.64a5.86 5.86 0 0 0-2.12 1.38A5.86 5.86 0 0 0 .64 4.14C.34 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.27 2.15.57 2.91a5.86 5.86 0 0 0 1.38 2.12 5.86 5.86 0 0 0 2.12 1.38c.76.3 1.64.51 2.91.57C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.27 2.91-.57a5.86 5.86 0 0 0 2.12-1.38 5.86 5.86 0 0 0 1.38-2.12c.3-.76.51-1.64.57-2.91.06-1.28.07-1.67.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.27-2.15-.57-2.91a5.86 5.86 0 0 0-1.38-2.12A5.86 5.86 0 0 0 19.86.64c-.76-.3-1.64-.51-2.91-.57C15.67.01 15.26 0 12 0z" />
    <path d="M12 5.84A6.16 6.16 0 1 0 18.16 12 6.16 6.16 0 0 0 12 5.84zm0 10.16A4 4 0 1 1 16 12a4 4 0 0 1-4 4z" />
    <circle cx="18.41" cy="5.59" r="1.44" />
  </svg>
);

const TikTokIcon: React.FC = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

const RedditIcon: React.FC = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
  </svg>
);

const SOCIAL_ICONS = {
  youtube: YouTubeIcon,
  linkedin: LinkedInIcon,
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  tiktok: TikTokIcon,
  reddit: RedditIcon,
} as const;

const ChevronIcon: React.FC<{ open: boolean }> = ({ open }) => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="currentColor"
    aria-hidden="true"
    className={`shrink-0 transition-transform duration-200 ${open ? "rotate-90" : ""}`}
  >
    <path d="M4.5 2 9 6 4.5 10V2z" />
  </svg>
);

const FooterLink: React.FC<{ link: FooterLinkItem }> = ({ link }) => {
  if (link.external) {
    return (
      <a
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.link}
      >
        {link.label}
      </a>
    );
  }

  if (link.href.startsWith("/")) {
    return (
      <Link href={link.href} className={styles.link}>
        {link.label}
      </Link>
    );
  }

  return (
    <a href={link.href} className={styles.link}>
      {link.label}
    </a>
  );
};

const FooterLinkList: React.FC<{
  links: FooterLinkItem[];
  className?: string;
}> = ({ links, className = "mt-4 flex flex-col gap-3.5" }) => (
  <ul className={className}>
    {links.map((link) => (
      <li key={link.label}>
        <FooterLink link={link} />
      </li>
    ))}
  </ul>
);

const FooterCollapsibleSection: React.FC<{
  title: string;
  links: FooterLinkItem[];
}> = ({ title, links }) => {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <div className={`border-b lg:border-b-0 ${styles.borderDivider}`}>
      <button
        type="button"
        className={`flex w-full items-center justify-between gap-4 py-4 text-left lg:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${styles.toggleFocus}`}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <span className={styles.heading}>{title}</span>
        <ChevronIcon open={open} />
      </button>

      <p className={`hidden lg:block ${styles.heading}`}>{title}</p>

      <div id={panelId} className={open ? "block pb-4 lg:pb-0" : "hidden lg:block"}>
        <FooterLinkList
          links={links}
          className="flex flex-col gap-3.5 pb-1 lg:mt-4 lg:pb-0"
        />
      </div>
    </div>
  );
};

export default function Footer() {
  const pathname = usePathname();
  const showFooter = FOOTER_MARKETING_PATHS.some((p) => pathname === p);
  const showMobileAppNav = MOBILE_APP_NAV_ITEMS.some(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  );

  const handleNewsletterSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  if (!showFooter && !showMobileAppNav) return null;

  return (
    <>
      {showMobileAppNav && (
        <nav className="fixed inset-x-0 bottom-0 z-[110] border-t border-[#ffffff1a] bg-[#4A1872] md:hidden">
          <ul className="grid grid-cols-3 items-center px-3 py-2">
            {MOBILE_APP_NAV_ITEMS.map(({ label, href, icon: Icon }) => {
              const isActive =
                pathname === href || pathname.startsWith(`${href}/`);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className="flex flex-col items-center justify-center gap-1.5 py-1"
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon
                      className={`h-4 w-4 ${isActive ? "text-[#A78BFA]" : "text-[#9C89BB]"}`}
                    />
                    <span
                      className={`text-xs ${isActive ? "text-[#A78BFA]" : "text-[#9C89BB]"}`}
                    >
                      {label}
                    </span>
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-[#C4B4FF]" : "bg-transparent"}`}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}

      {showFooter && (
        <footer className={`py-16 transition-colors lg:py-20 ${styles.footer}`}>
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex flex-col gap-10 lg:grid lg:grid-cols-[minmax(0,380px)_repeat(3,minmax(0,1fr))] lg:gap-8 xl:gap-12">
              <div className="flex flex-col gap-10">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Image
                      src={FlolabsLogo}
                      alt=""
                      width={36}
                      height={36}
                      className="h-9 w-9 shrink-0"
                    />
                    <span
                      className={`text-lg font-bold uppercase tracking-wide ${styles.wordmark}`}
                    >
                      {FOOTER_BRAND}
                    </span>
                    <span
                      className={`hidden h-4 w-px sm:block ${styles.divider}`}
                      aria-hidden="true"
                    />
                    <span className={`text-[13px] ${styles.muted}`}>
                      {FOOTER_BYLINE}
                    </span>
                  </div>
                  <p
                    className={`mt-5 max-w-sm text-[15px] leading-relaxed ${styles.muted}`}
                  >
                    {FOOTER_DESCRIPTION}
                  </p>
                </div>

                <div>
                  <p className={styles.heading}>Newsletter</p>
                  <p className={`mt-3 text-[13px] ${styles.muted}`}>
                    Receive the newest {FOOTER_BRAND} updates at:
                  </p>
                  <form
                    onSubmit={handleNewsletterSubmit}
                    className="mt-4 w-full max-w-sm"
                    noValidate
                  >
                    <div className="relative flex w-full">
                      <label htmlFor="footer-email" className="sr-only">
                        Email address for newsletter
                      </label>
                      <input
                        id="footer-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder="Enter your email..."
                        className={`w-full border py-3 pl-4 pr-12 text-[15px] focus:outline-none focus-visible:ring-2 ${styles.input}`}
                      />
                      <button
                        type="submit"
                        className={`absolute right-0 top-0 flex aspect-square h-full w-11 items-center justify-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${styles.submit}`}
                        aria-label="Subscribe to newsletter"
                      >
                        <SendIcon />
                      </button>
                    </div>
                  </form>
                </div>

                <div>
                  <p className={styles.heading}>Social Media</p>
                  <div className="mt-4 flex flex-wrap items-center gap-4">
                    {FOOTER_SOCIAL.map(({ href, label, icon }) => {
                      const Icon = SOCIAL_ICONS[icon];
                      return (
                        <a
                          key={icon}
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${styles.social}`}
                          aria-label={label}
                        >
                          <Icon />
                        </a>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div>
                <FooterCollapsibleSection
                  title="Navigation"
                  links={FOOTER_NAVIGATION_LINKS}
                />
              </div>

              <div>
                <FooterCollapsibleSection
                  title="Projects"
                  links={FOOTER_PROJECT_LINKS}
                />
              </div>

              <div>
                <FooterCollapsibleSection
                  title="Company"
                  links={FOOTER_COMPANY_LINKS}
                />
              </div>
            </div>

            <div className={`mt-16 border-t pt-8 ${styles.borderDivider}`}>
              <p
                className={`text-center text-[13px] tracking-[0.15em] ${styles.muted}`}
              >
                Live Long and Prosper
              </p>
            </div>
          </div>
        </footer>
      )}
    </>
  );
}
