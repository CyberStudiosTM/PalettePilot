import { useState, type KeyboardEvent } from 'react';

interface Props {
  label: string;
  value: string;
  valid?: (value: string) => boolean;
  onCommit: (value: string) => void;
  className?: string;
  maxLength?: number;
}

export function Field({ label, value, valid = text => text.length > 0, onCommit, className, maxLength }: Props) {
  const [draft, setDraft] = useState<string | null>(null);

  function finish() {
    if (draft !== null && valid(draft.trim())) onCommit(draft.trim());
    setDraft(null);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' && !event.nativeEvent.isComposing) event.currentTarget.blur();
    if (event.key === 'Escape') setDraft(null);
  }

  return <input
    className={className} aria-label={label} aria-invalid={draft !== null && !valid(draft.trim())}
    maxLength={maxLength} value={draft ?? value} onChange={event => setDraft(event.target.value)}
    onBlur={finish} onKeyDown={onKeyDown}
  />;
}
