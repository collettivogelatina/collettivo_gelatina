"use client";
import { useEffect } from "react";

export default function GumroadEmbed({ url }: { url: string }) {
  useEffect(() => {
    if (document.querySelector('script[src="https://gumroad.com/js/gumroad-embed.js"]')) return;
    const script = document.createElement("script");
    script.src = "https://gumroad.com/js/gumroad-embed.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <div
      className="gumroad-product-embed w-full rounded-3xl overflow-hidden"
      style={{ minHeight: 400 }}
    >
      <a href={url}>Caricamento...</a>
    </div>
  );
}
