"use client";

const TICKER_TEXT =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

interface NewsTickerProps {
  visible: boolean;
  onClose: () => void;
  label?: string;
}

export function NewsTicker({ visible, onClose, label = "BREAKING" }: NewsTickerProps) {
  if (!visible) return null;

  return (
    <div className="relative flex h-7 shrink-0 items-center overflow-hidden border-t border-cyan-500/30 bg-[#070910]">
      {/* Label badge */}
      <div className="z-10 flex h-full shrink-0 items-center gap-2 border-r border-cyan-500/30 bg-red-700 px-3">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
        <span className="text-[10px] font-bold tracking-[0.2em] text-white">{label}</span>
      </div>

      {/* Scrolling track */}
      <div className="relative flex-1 overflow-hidden">
        <div className="ticker-track text-[11px] tracking-wide text-zinc-300">
          {/* Duplicated so the loop is seamless — second copy fills while first resets */}
          <span className="px-8">{TICKER_TEXT}</span>
          <span className="px-8">{TICKER_TEXT}</span>
        </div>
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="z-10 shrink-0 border-l border-cyan-500/20 px-3 text-[11px] text-zinc-600 transition-colors hover:text-zinc-300"
      >
        ✕
      </button>
    </div>
  );
}
