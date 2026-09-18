import { useEffect, useRef, useState } from "react";
import { listenForCompletionCount, loadCompletionCount } from "../services/completionCount";

const numberFormatter = new Intl.NumberFormat("en-US");

export function CompletionCounter() {
  const [count, setCount] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const receivedLiveUpdate = useRef(false);

  useEffect(() => {
    const controller = new AbortController();

    const stopListening = listenForCompletionCount((nextCount) => {
      receivedLiveUpdate.current = true;
      setCount(nextCount);
    });

    void loadCompletionCount(controller.signal).then((loadedCount) => {
      if (loadedCount !== null && !receivedLiveUpdate.current) {
        setCount(loadedCount);
      }
    });

    return () => {
      controller.abort();
      stopListening();
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  if (count === null) return null;

  return (
    <div className="completion-counter" ref={containerRef}>
      <div className="completion-counter-row">
        <span aria-live="polite">
          {numberFormatter.format(count)} {count === 1 ? "assessment" : "assessments"} completed
        </span>

        <button ref={triggerRef} type="button" className="completion-info-button" aria-label="How completion counting works" aria-expanded={isOpen} aria-controls="completion-count-explanation" onClick={() => setIsOpen((open) => !open)}>
          ?
        </button>
      </div>

      {isOpen && (
        <div className="completion-count-explanation" id="completion-count-explanation" role="note">
          We count completions, not answers. Your assessment responses and results are never sent to or stored with the count. The total is approximate and does not identify unique people.
        </div>
      )}
    </div>
  );
}
