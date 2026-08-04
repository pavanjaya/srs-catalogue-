"use client";

export function ShareButton({
  productName,
  pin,
}: {
  productName: string;
  pin?: string;
}) {
  function handleShare() {
    const url = window.location.href;
    const pinLine = pin ? `\nAccess PIN: ${pin}` : "";
    const text = `Hi, here's the catalogue for ${productName} you asked about 👇\n${url}${pinLine}\nYou can also browse our other designs from the same page.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  return (
    <button
      onClick={handleShare}
      className="font-sans-ui inline-flex items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-white px-6 py-3 text-sm font-medium text-[var(--ink)] transition hover:border-[var(--accent)] hover:bg-[var(--accent)]"
    >
      Share on WhatsApp
    </button>
  );
}
