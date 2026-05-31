"use client";
// ↑ Next.js directive — tells the framework this file runs in the browser, not on the server.
// Only browser-side components can use React hooks (useState, useEffect) and handle events.

// External library imports — pulling in specific named exports we need
import { useChat } from "@ai-sdk/react";          // Vercel AI SDK hook that manages the full chat lifecycle
import { DefaultChatTransport } from "ai";         // Configures how messages are sent to the API (streaming over HTTP)
import { useState, useEffect, useRef } from "react"; // Core React hooks (explained where each is used below)
import { NewsMarker } from "./MapWidget";           // TypeScript type for a map pin — shared across components


// ─── Static data ─────────────────────────────────────────────────────────────
// A plain array of strings defined outside the component so it is only created
// once at module load time, not re-created on every render.
const COMMAND_SUGGESTIONS = [
  "Show me Tokyo",
  "Show me New York City",
  "Show me London",
  "Show me Paris",
  "Show me Los Angeles",
  "Show me Chicago",
  "Show me Miami",
  "Show me Newark, NJ",
  "Zoom into Newark, NJ",
  "Navigate to the Eiffel Tower",
  "Navigate to Times Square",
  "Take me to the Strait of Hormuz",
  "Place a marker in Paris",
  "Place a marker in Tokyo",
  "Place a marker in London",
  "Pin Cape Canaveral",
  "Drop markers in London, Berlin, and Rome",
  "Place a marker at Wembley Stadium",
  "Clear the map",
  "Remove all markers",
  "Reset",
];


// ─── TypeScript interfaces ────────────────────────────────────────────────────
// An interface describes the exact shape of a JavaScript object.
// TypeScript uses these at compile time only — they disappear at runtime.
// The "?" after a field name means that field is optional (may be undefined).

// Describes the data the AI returns when it calls the placeMarker tool.
// Each item in the returned array will have these fields.
interface PlaceMarkerOutput {
  title: string;       // Label shown on the map pin
  description?: string; // Optional popup text — may not always be provided
  lat: number;         // Latitude coordinate
  lng: number;         // Longitude coordinate
}

// Describes the data the AI returns when it calls the showLocation tool.
interface ShowLocationOutput {
  name: string; // Human-readable location name (e.g. "Tokyo, Japan")
  lat: number;
  lng: number;
  zoom: number; // How far to zoom in: 4 = country, 10 = city, 14 = landmark
}

// Describes the props (inputs) this component accepts from its parent (page.tsx).
// Props are how parent components pass data and callbacks down to children.
interface ChatWindowProps {
  // onMarkers is a callback function — the parent passes it in, and we call it
  // whenever the AI places or clears markers. This is the React pattern for
  // "lifting state up": the child triggers a change, the parent owns the data.
  onMarkers: (markers: NewsMarker[]) => void;

  // onMapView tells the parent to reposition the map to a new center + zoom level.
  // The arrow syntax "(center, zoom) => void" means: a function that takes those
  // two arguments and returns nothing (void).
  onMapView: (center: { lat: number; lng: number }, zoom: number) => void;
}


// ─── Component ───────────────────────────────────────────────────────────────
// Arrow function syntax: "const Foo = (props) => { ... }"
// This is equivalent to "function Foo(props) { ... }" but arrow functions are
// commonly used for React components and callbacks because they are concise and
// don't rebind "this". We destructure the props directly in the parameter list.
export function ChatWindow({ onMarkers, onMapView }: ChatWindowProps) {

  // Read an environment variable to decide which API endpoint to use.
  // NEXT_PUBLIC_ prefix means Next.js exposes this variable to the browser.
  // The ternary "condition ? a : b" returns a if true, b if false.
  const chatApi = process.env.NEXT_PUBLIC_USE_MOCK === "true" ? "/api/chat-mock" : "/api/chat";

  // ── useChat (Vercel AI SDK hook) ─────────────────────────────────────────
  // useChat manages the entire conversation: sending messages, receiving streamed
  // responses, and tracking status. It returns an object we destructure into:
  //   messages — array of all chat turns so far
  //   sendMessage — function to send a new user message
  //   status — current state: "idle" | "submitted" | "streaming" | "error"
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: chatApi }),
    // DefaultChatTransport handles the HTTP POST and SSE (server-sent events)
    // streaming protocol that delivers AI tokens incrementally to the UI.
  });

  // ── useState hooks ───────────────────────────────────────────────────────
  // useState is how React stores values that change over time.
  // Syntax: const [value, setValue] = useState(initialValue)
  // When setValue is called, React re-renders the component with the new value.

  // Tracks what the user is currently typing in the input field.
  const [input, setInput] = useState("");

  // Tracks which suggestion is highlighted (-1 means none selected).
  const [suggestionIndex, setSuggestionIndex] = useState(-1);

  // Controls whether the autocomplete dropdown is visible.
  const [showSuggestions, setShowSuggestions] = useState(false);

  // ── useRef hook ──────────────────────────────────────────────────────────
  // useRef gives us a stable reference to a DOM element that persists across
  // renders WITHOUT causing a re-render when it changes. Here we use it to
  // programmatically focus the input field after a suggestion is clicked.
  const inputRef = useRef<HTMLInputElement>(null);
  // The <HTMLInputElement> type parameter tells TypeScript what kind of element
  // this ref will point to, enabling type-safe access to .focus(), .value, etc.

  // ── Derived value (not state) ────────────────────────────────────────────
  // This is computed inline on every render — no hook needed because it depends
  // only on existing state (input). Arrow function with .filter():
  //   .filter() takes a callback and returns a new array containing only items
  //   for which the callback returns true. The "=>" is the arrow function syntax.
  const filteredSuggestions = input.trim()
    ? COMMAND_SUGGESTIONS.filter((s) =>
        s.toLowerCase().includes(input.toLowerCase())
      )
    : []; // If input is empty, show nothing

  // True while the AI is actively generating a response — used to disable
  // the submit button and prevent sending duplicate messages.
  const isLoading = status === "streaming" || status === "submitted";


  // ── useEffect hook ───────────────────────────────────────────────────────
  // useEffect runs side effects — code that reaches outside React's render cycle.
  // Syntax: useEffect(() => { ... }, [dependencies])
  // React re-runs this effect whenever any value in the dependency array changes.
  // Here: re-run every time the messages array updates (new AI response arrived).
  useEffect(() => {
    // Early return — don't touch the map if no messages exist yet.
    // This prevents wiping out the pre-loaded event markers on first render.
    if (messages.length === 0) return;

    // Accumulate all markers across the entire conversation history.
    // We replay all messages on every run so the map stays in sync with chat state.
    const allMarkers: NewsMarker[] = [];

    // Track the most recent map view change so we only pan once after processing.
    let latestView: { center: { lat: number; lng: number }; zoom: number } | null = null;

    // for...of loops over each message in the conversation.
    // Each message has a "parts" array — a message can contain text AND tool calls.
    for (const message of messages) {
      for (const part of message.parts) {

        // Tool outputs arrive as typed "part" objects. We check part.type to know
        // which AI tool was called, and part.state to confirm the output is ready.

        // clearMarkers tool — wipe the accumulated markers and reset the view
        if (part.type === "tool-clearMarkers" && part.state === "output-available") {
          allMarkers.length = 0; // Mutating .length = 0 empties the array in place
          latestView = { center: { lat: 39.8283, lng: -98.5795 }, zoom: 4 };
        }

        // placeMarker tool — the AI returned an array of locations to pin
        if (part.type === "tool-placeMarker" && part.state === "output-available") {
          // "as PlaceMarkerOutput[]" is a TypeScript type assertion — we tell the
          // compiler what shape this runtime value has so we can access its fields.
          const markers = part.output as PlaceMarkerOutput[];
          for (const m of markers) {
            allMarkers.push({
              id: `${m.lat}-${m.lng}`, // Template literal — embeds variables inside a string
              position: { lat: m.lat, lng: m.lng },
              title: m.title,
              description: m.description,
            });
          }
        }

        // showLocation tool — the AI navigated to a specific place
        if (part.type === "tool-showLocation" && part.state === "output-available") {
          const loc = part.output as ShowLocationOutput;
          allMarkers.push({
            id: `${loc.lat}-${loc.lng}`,
            position: { lat: loc.lat, lng: loc.lng },
            title: loc.name,
          });
          latestView = { center: { lat: loc.lat, lng: loc.lng }, zoom: loc.zoom };
        }
      }
    }

    // Call the parent-provided callback with the final marker list.
    // This is how the ChatWindow tells MapWidget which pins to show.
    onMarkers(allMarkers);

    // Only pan the map if a navigation tool was called this cycle.
    if (latestView) {
      onMapView(latestView.center, latestView.zoom);
    }
  }, [messages, onMarkers, onMapView]);
  // ↑ Dependency array — effect re-runs when any of these change.
  //   Including onMarkers and onMapView is required by React's exhaustive-deps rule
  //   even though they are stable references passed from the parent.


  // ─── Event handlers ───────────────────────────────────────────────────────
  // Arrow functions assigned to const — the standard React pattern for handlers.
  // "e" is the event object React passes automatically; it contains info about
  // what happened (which key was pressed, which element fired the event, etc.).

  // Handles form submission when the user presses Enter or clicks ▶
  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault(); // Stops the browser's default form behavior (page reload)
    if (!input.trim() || isLoading) return; // Guard: don't send empty or duplicate
    sendMessage({ text: input }); // Sends the message through useChat → API
    setInput("");                 // Clear the input field
    setShowSuggestions(false);
    setSuggestionIndex(-1);
  };

  // Fires on every keystroke — keeps the input state in sync with the DOM value
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value); // e.target is the <input> element; .value is its current text
    setShowSuggestions(true); // Re-open dropdown when the user types
    setSuggestionIndex(-1);   // Reset highlight whenever the query changes
  };

  // Handles keyboard navigation inside the suggestions dropdown
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || filteredSuggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault(); // Prevents the cursor jumping to end of input
      // Functional update form of setState: receives the previous value as "i"
      // and returns the new value. Math.min clamps to the last item index.
      setSuggestionIndex((i) => Math.min(i + 1, filteredSuggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSuggestionIndex((i) => Math.max(i - 1, -1)); // -1 means no selection
    } else if (e.key === "Enter" && suggestionIndex >= 0) {
      e.preventDefault(); // Prevent the form from submitting — just fill the input
      setInput(filteredSuggestions[suggestionIndex]);
      setShowSuggestions(false);
      setSuggestionIndex(-1);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setSuggestionIndex(-1);
    }
  };

  // Called when the user clicks a suggestion item
  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    setShowSuggestions(false);
    setSuggestionIndex(-1);
    // Optional chaining: "?." safely calls .focus() only if inputRef.current is not null.
    // If the ref hasn't attached to the DOM yet, this is a no-op instead of an error.
    inputRef.current?.focus();
  };

  // Renders a single message part as JSX.
  // The parameter type uses TypeScript's indexed access: "(typeof messages)[number]"
  // reads as "one element of the messages array", then "['parts'][number]" reads
  // as "one element of that message's parts array". This avoids writing out the
  // full type manually and stays in sync if the SDK type ever changes.
  const renderPart = (
    part: (typeof messages)[number]["parts"][number],
    index: number
  ) => {
    // Render plain text content from the AI
    if (part.type === "text") {
      if (!part.text) return null;
      return (
        <p key={index} className="whitespace-pre-wrap text-[11px] leading-relaxed text-zinc-300">
          {part.text}
        </p>
      );
    }

    // Render a terminal-style confirmation when showLocation ran successfully
    if (part.type === "tool-showLocation") {
      if (part.state === "output-available") {
        const loc = part.output as ShowLocationOutput;
        return (
          <div key={index} className="mt-1.5 flex items-center gap-1.5 text-[10px] text-cyan-600">
            <span>▶</span>
            <span className="font-mono">flyTo({loc.name}, zoom={loc.zoom})</span>
          </div>
        );
      }
      return null;
    }

    // Render a confirmation when placeMarker ran — shows how many pins were dropped
    if (part.type === "tool-placeMarker") {
      if (part.state === "output-available") {
        const markers = part.output as PlaceMarkerOutput[];
        return (
          <div key={index} className="mt-1.5 flex items-center gap-1.5 text-[10px] text-cyan-600">
            <span>▶</span>
            {/* Ternary inside JSX — adds "s" to "location" when count > 1 */}
            <span className="font-mono">pin({markers.length} location{markers.length > 1 ? "s" : ""})</span>
          </div>
        );
      }
      return null;
    }

    // Render a red confirmation when clearMarkers ran
    if (part.type === "tool-clearMarkers") {
      if (part.state === "output-available") {
        return (
          <div key={index} className="mt-1.5 flex items-center gap-1.5 text-[10px] text-red-500">
            <span>✕</span>
            <span className="font-mono">clearMarkers()</span>
          </div>
        );
      }
      return null;
    }

    return null;
  };


  // ─── JSX (component output) ───────────────────────────────────────────────
  // JSX looks like HTML but compiles to React.createElement() calls.
  // Curly braces {} switch from JSX mode back to JavaScript expressions.
  return (
    <div className="flex h-full flex-col bg-[#0b0d12]">

      {/* Panel header */}
      <div className="border-b border-cyan-500/20 px-4 py-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] tracking-[0.2em] text-cyan-400">// COMMAND</span>

          {/* Sign in with Meta — UI placeholder, no auth logic yet */}
          <button
            type="button"
            className="flex items-center gap-1.5 rounded border border-[#1877F2]/40 bg-[#1877F2]/10 px-2 py-1 text-[10px] text-[#4a9eff] transition-colors hover:bg-[#1877F2]/20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-3 w-3 fill-[#4a9eff]" aria-hidden="true">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/>
            </svg>
            Sign in with Meta
          </button>
        </div>

        <p className="mt-1 text-[10px] text-zinc-700">
          Model: <span className="text-zinc-500">gpt-4o-mini</span>
          {"  ·  "}Tools: <span className="text-zinc-500">3 active</span>
        </p>
      </div>

      {/* Messages — scrollable chat history */}
      <div className="flex-1 overflow-y-auto p-3">
        {/* Conditional rendering: only show the empty state when messages array is empty */}
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <p className="text-center text-[11px] tracking-wider text-zinc-700">
              {">"} awaiting command...
            </p>
          </div>
        )}

        <div className="space-y-3">
          {/* .map() iterates the array and returns a JSX element for each message.
              The "key" prop is required by React to efficiently update the list —
              it must be unique and stable (not an array index if order can change). */}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex flex-col ${message.role === "user" ? "items-end" : "items-start"}`}
            >
              <span className="mb-1 text-[9px] tracking-[0.2em] text-zinc-700">
                {message.role === "user" ? "OPERATOR" : "// NEXUS AI"}
              </span>
              <div
                className={`max-w-[88%] rounded px-3 py-2 ${
                  message.role === "user"
                    ? "border border-cyan-500/30 bg-cyan-500/10 text-cyan-100"
                    : "border border-zinc-700/50 bg-zinc-900/80 text-zinc-300"
                }`}
              >
                {/* Render each part of the message (text, tool calls, etc.) */}
                {message.parts.map((part, index) => renderPart(part, index))}
              </div>
            </div>
          ))}

          {/* Loading indicator — three bouncing dots with staggered animation delay */}
          {isLoading && (
            <div className="flex flex-col items-start">
              <span className="mb-1 text-[9px] tracking-[0.2em] text-zinc-700">// NEXUS AI</span>
              <div className="flex gap-1.5 rounded border border-zinc-700/50 bg-zinc-900/80 px-3 py-2">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-500" style={{ animationDelay: "0ms" }} />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-500" style={{ animationDelay: "100ms" }} />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-500" style={{ animationDelay: "200ms" }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick action buttons — visual placeholders, not yet wired to actions */}
      <div className="flex flex-wrap gap-1.5 border-t border-cyan-500/20 px-3 py-2">
        {["◆ PIN", "◉ HEAT", "≡ FILTER", "✕ CLEAR", "↩ UNDO"].map((label) => (
          <button
            key={label}
            className="rounded border border-zinc-700 px-2 py-1 text-[10px] tracking-wider text-zinc-600 transition-colors hover:border-zinc-500 hover:text-zinc-300"
          >
            {label}
          </button>
        ))}
      </div>

      {/* Input area — autocomplete dropdown + form */}
      <div className="relative border-t border-cyan-500/20">

        {/* Autocomplete dropdown — rendered above the input using absolute positioning.
            "bottom-full" places it flush with the top edge of this container. */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute bottom-full left-0 right-0 z-50 max-h-48 overflow-y-auto border border-cyan-500/20 bg-[#0b0d12] shadow-lg">
            {filteredSuggestions.map((suggestion, i) => (
              <button
                key={suggestion}
                type="button"
                // onMouseDown fires before onBlur, so e.preventDefault() here stops
                // the input from losing focus before we can register the click.
                onMouseDown={(e) => { e.preventDefault(); handleSuggestionClick(suggestion); }}
                className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-[11px] font-mono transition-colors ${
                  i === suggestionIndex
                    ? "bg-cyan-500/15 text-cyan-300"
                    : "text-zinc-500 hover:bg-zinc-800/60 hover:text-zinc-300"
                }`}
              >
                <span className="text-cyan-700">›</span>
                {suggestion}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-cyan-500">{">"}</span>
            <input
              ref={inputRef}  // Attaches the useRef reference to this DOM element
              type="text"
              value={input}   // "Controlled input" — React owns the value, not the DOM
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
              onFocus={() => setShowSuggestions(true)}
              // setTimeout delay of 100ms lets the click event on a suggestion fire
              // before the blur event closes the dropdown and swallows the click.
              onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
              placeholder="Enter command or question..."
              className="flex-1 bg-transparent text-xs text-zinc-300 placeholder-zinc-700 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="rounded border border-cyan-500/40 bg-cyan-500/10 px-2 py-1 text-[10px] text-cyan-400 transition-colors hover:bg-cyan-500/20 disabled:opacity-30"
            >
              ▶
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
