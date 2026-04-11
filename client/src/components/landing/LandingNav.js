import React from "react";

const NAV_HEIGHT = 64; // should match CSS --landing-nav-h

function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;

  // scrollIntoView + CSS scroll-margin-top handles sticky header offset
  el.scrollIntoView({ behavior: "smooth", block: "start" });

  // Optional: set hash without jump
  window.history.replaceState(null, "", `#${id}`);
}

export default function LandingNav() {
  const items = [
    { id: "features", label: "Features" },
    { id: "how", label: "How it works" },
    { id: "roles", label: "Roles" },
    { id: "faq", label: "FAQ" },
  ];

  return (
    <header className="landing-nav" style={{ height: NAV_HEIGHT }}>
      <div className="container landing-nav-inner">
        {/* left spacer (keeps nav perfectly centered) */}
        <div className="landing-nav-spacer" />

        <nav className="landing-links" aria-label="Landing navigation">
          {items.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                scrollToId(item.id);
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* right spacer */}
        <div className="landing-nav-spacer" />
      </div>
    </header>
  );
}