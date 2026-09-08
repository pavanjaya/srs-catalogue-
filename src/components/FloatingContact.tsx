"use client";

import { useState } from "react";
import { studio } from "@/lib/studio";
import { PhoneIcon, WhatsAppIcon, EmailIcon, InstagramIcon } from "@/components/ConnectIcons";

// Ported from the main studio website's FloatingContact, so the catalogue
// site carries the same signature contact affordance.
function ChatIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function FloatingContact() {
  const [open, setOpen] = useState(false);

  const options = [
    { label: "Call", href: `tel:${studio.phone}`, icon: PhoneIcon, external: false },
    {
      label: "WhatsApp",
      href: `https://wa.me/${studio.whatsapp}`,
      icon: WhatsAppIcon,
      external: true,
    },
    {
      label: "Instagram DM",
      href: studio.instagramDm,
      icon: InstagramIcon,
      external: true,
    },
    { label: "Email", href: `mailto:${studio.email}`, icon: EmailIcon, external: false },
  ];

  return (
    <div className="font-sans-ui fixed right-6 bottom-6 z-40 flex flex-col items-end gap-3">
      {open && (
        <div className="animate-fade-up flex flex-col items-end gap-2">
          {options.map(({ label, href, icon: Icon, external }) => (
            <a
              key={label}
              href={href}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener noreferrer" : undefined}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-full bg-[var(--accent)] py-2.5 pr-4 pl-3 text-sm text-[var(--ink)] shadow-lg transition hover:bg-[var(--ink)] hover:text-white"
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </a>
          ))}
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close contact options" : "Contact the studio"}
        aria-expanded={open}
        className="relative flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[var(--accent)] text-[var(--ink)] shadow-lg transition hover:bg-[var(--ink)] hover:text-white"
      >
        {!open && (
          <span className="animate-pulse-ring absolute inset-0 -z-10 rounded-full bg-[var(--accent)]/60" />
        )}
        {open ? <CloseIcon /> : <ChatIcon />}
      </button>
    </div>
  );
}
