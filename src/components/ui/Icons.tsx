type P = { className?: string };
const base = (className = "h-5 w-5") => ({
  className,
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
  "aria-hidden": true,
});

export const SearchIcon = ({ className }: P) => (
  <svg {...base(className)}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
);
export const BagIcon = ({ className }: P) => (
  <svg {...base(className)}><path d="M5 8h14l-1 13H6L5 8Z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></svg>
);
export const UserIcon = ({ className }: P) => (
  <svg {...base(className)}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>
);
export const HeartIcon = ({ className, filled }: P & { filled?: boolean }) => (
  <svg {...base(className)} fill={filled ? "currentColor" : "none"}>
    <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />
  </svg>
);
export const MenuIcon = ({ className }: P) => (
  <svg {...base(className)}><path d="M4 7h16M4 12h16M4 17h16" /></svg>
);
export const CloseIcon = ({ className }: P) => (
  <svg {...base(className)}><path d="M6 6l12 12M18 6 6 18" /></svg>
);
export const ChevronLeft = ({ className }: P) => (
  <svg {...base(className)}><path d="m15 6-6 6 6 6" /></svg>
);
export const ChevronRight = ({ className }: P) => (
  <svg {...base(className)}><path d="m9 6 6 6-6 6" /></svg>
);
export const ChevronDown = ({ className }: P) => (
  <svg {...base(className)}><path d="m6 9 6 6 6-6" /></svg>
);
export const PlusIcon = ({ className }: P) => (
  <svg {...base(className)}><path d="M12 5v14M5 12h14" /></svg>
);
export const MinusIcon = ({ className }: P) => (
  <svg {...base(className)}><path d="M5 12h14" /></svg>
);
export const TruckIcon = ({ className }: P) => (
  <svg {...base(className)}><path d="M3 6h11v10H3zM14 10h4l3 3v3h-7" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" /></svg>
);
export const ShieldIcon = ({ className }: P) => (
  <svg {...base(className)}><path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z" /><path d="m9 12 2 2 4-4" /></svg>
);
export const CashIcon = ({ className }: P) => (
  <svg {...base(className)}><rect x="3" y="6" width="18" height="12" rx="2" /><circle cx="12" cy="12" r="2.5" /><path d="M6 9v.01M18 15v.01" /></svg>
);
export const PinIcon = ({ className }: P) => (
  <svg {...base(className)}><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11Z" /><circle cx="12" cy="10" r="2.5" /></svg>
);
export const FilterIcon = ({ className }: P) => (
  <svg {...base(className)}><path d="M4 6h16M7 12h10M10 18h4" /></svg>
);
export const StarIcon = ({ className, filled }: P & { filled?: boolean }) => (
  <svg {...base(className)} fill={filled ? "currentColor" : "none"}>
    <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z" />
  </svg>
);
export const Grid2Icon = ({ className }: P) => (
  <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden><rect x="1" y="1" width="8" height="8" /><rect x="11" y="1" width="8" height="8" /><rect x="1" y="11" width="8" height="8" /><rect x="11" y="11" width="8" height="8" /></svg>
);
export const Grid3Icon = ({ className }: P) => (
  <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
    {[1, 8, 15].flatMap((y) => [1, 8, 15].map((x) => <rect key={`${x}${y}`} x={x} y={y} width="4.5" height="4.5" />))}
  </svg>
);
export const ListIcon = ({ className }: P) => (
  <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
    {[2, 6, 10, 14, 18].map((y) => <rect key={y} x="1" y={y - 1} width="18" height="1.8" />)}
  </svg>
);

/* Brand social icons (filled) */
export const FacebookIcon = ({ className = "h-4 w-4" }: P) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M14 8h3V4h-3c-2.8 0-4 1.7-4 4.3V10H7v4h3v8h4v-8h3l1-4h-4V8.6c0-.4.3-.6.6-.6Z" /></svg>
);
export const InstagramIcon = ({ className = "h-4 w-4" }: P) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" /></svg>
);
export const YoutubeIcon = ({ className = "h-4 w-4" }: P) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M22 8.2a3 3 0 0 0-2.1-2.1C18 5.6 12 5.6 12 5.6s-6 0-7.9.5A3 3 0 0 0 2 8.2 31 31 0 0 0 1.6 12 31 31 0 0 0 2 15.8a3 3 0 0 0 2.1 2.1c1.9.5 7.9.5 7.9.5s6 0 7.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .4-3.8 31 31 0 0 0-.4-3.8ZM10 15V9l5.2 3L10 15Z" /></svg>
);
export const PinterestIcon = ({ className = "h-4 w-4" }: P) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 2a10 10 0 0 0-3.6 19.3c-.1-.8-.2-2 0-2.9l1.2-5s-.3-.6-.3-1.5c0-1.4.8-2.4 1.8-2.4.9 0 1.3.6 1.3 1.4 0 .9-.5 2.1-.8 3.3-.2 1 .5 1.8 1.5 1.8 1.8 0 3.1-1.9 3.1-4.6 0-2.4-1.7-4.1-4.2-4.1-2.9 0-4.6 2.1-4.6 4.4 0 .9.3 1.8.8 2.3.1.1.1.2.1.3l-.3 1.2c0 .2-.2.3-.4.2-1.3-.6-2.1-2.5-2.1-4 0-3.3 2.4-6.3 6.9-6.3 3.6 0 6.4 2.6 6.4 6 0 3.6-2.3 6.5-5.4 6.5-1.1 0-2.1-.6-2.4-1.2l-.7 2.5c-.2.9-.9 2.1-1.3 2.8A10 10 0 1 0 12 2Z" /></svg>
);
export const XIcon = ({ className = "h-4 w-4" }: P) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M17.8 3H21l-7 8 8.2 10h-6.4l-5-6.3L5 21H1.8l7.5-8.6L1.5 3H8l4.5 5.8L17.8 3Zm-1.1 16h1.8L7.4 4.9H5.5L16.7 19Z" /></svg>
);
export const WhatsappIcon = ({ className = "h-4 w-4" }: P) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.6 14.2c-.2.7-1.4 1.3-2 1.4-.5.1-1.2.1-1.9-.1a17 17 0 0 1-1.8-.7 13.5 13.5 0 0 1-5.1-4.5c-.4-.5-1.2-1.7-1.2-3.2s.8-2.3 1.1-2.6c.3-.3.6-.4.8-.4h.6c.2 0 .4 0 .7.5l1 2.4c.1.2.1.4 0 .6l-.4.6-.5.5c-.2.2-.3.4-.1.7.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.5.1.7-.1l.9-1.1c.2-.3.4-.3.7-.2l2.3 1.1c.3.1.5.2.6.4 0 .1 0 .8-.2 1.5Z" /></svg>
);
export const MailIcon = ({ className }: P) => (
  <svg {...base(className ?? "h-4 w-4")}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
);
