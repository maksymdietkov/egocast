import { Check, User } from 'lucide-react';
import { TONE_META } from '../data/toneMeta';
import type { ToneInfo } from '../types/weather';

interface TonePickerProps {
  tones: ToneInfo[];
  activeTone: string;
  onSelect: (toneId: string) => void;
  onBack: () => void;
  onAccountClick?: () => void;
}

export function TonePicker({ tones, activeTone, onSelect, onBack, onAccountClick }: TonePickerProps) {
  return (
    <div className="tone-picker">
      <div className="tone-picker-header">
        <button type="button" className="tone-picker-back" onClick={onBack}>
          ← Back
        </button>
        <button
          type="button"
          className="account-button"
          aria-label="Account"
          onClick={onAccountClick}
        >
          <User size={14} aria-hidden="true" />
        </button>
      </div>

      <p className="tone-picker-title">Choose a voice</p>

      <div className="tone-picker-list">
        {tones.map((tone) => {
          const meta = TONE_META[tone.id];
          const isActive = tone.id === activeTone;

          return (
            <button
              key={tone.id}
              type="button"
              className={`tone-card${isActive ? ' active' : ''}`}
              onClick={() => onSelect(tone.id)}
            >
              <div className="tone-card-top">
                <span className="tone-card-name">
                  {isActive && <Check size={16} className="tone-card-check" aria-hidden="true" />}
                  {meta?.label ?? tone.id}
                </span>
                {tone.premium && <span className="tone-card-badge">Premium</span>}
              </div>
              <p className="tone-card-example">{meta?.example ?? ''}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}