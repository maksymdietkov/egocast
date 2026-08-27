import { forwardRef } from 'react';
import { Thermometer, Wind, Droplets, CloudRain, Sun, type LucideIcon } from 'lucide-react';
import type { AdviceResponse } from '../types/weather';

const EXPAND_ICONS: Record<string, LucideIcon> = {
  temp: Thermometer,
  feels_like: Thermometer,
  wind: Wind,
  humidity: Droplets,
  precipitation: CloudRain,
  uv: Sun,
};

interface ShareCardProps {
  catEmoji: string;
  locationLabel: string;
  advice: AdviceResponse;
  includeExpand: boolean;
  capitalize: (text: string) => string;
}

// Rendered off-screen (see .share-card-offscreen in App.css) purely so html2canvas
// has a clean, fixed-size, self-contained node to rasterize. Deliberately does NOT
// reuse the main screen's live responsive layout or theme CSS variables — a
// separate, fixed palette here means the shared image always looks the same
// regardless of viewport size and won't silently break if the main theme changes.
export const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
  ({ catEmoji, locationLabel, advice, includeExpand, capitalize }, ref) => {
    return (
      <div ref={ref} className="share-card">
        <div className="share-card-location">{locationLabel}</div>
        <div className="share-card-cat" aria-hidden="true">
          {catEmoji}
        </div>
        <p className="share-card-advice">{advice.advice}</p>

        {includeExpand && (
          <div className="share-card-expand">
            {Object.entries(advice.expandComments).map(([key, line]) => {
              const Icon = EXPAND_ICONS[key];
              return (
                <p key={key} className="share-card-expand-line">
                  {Icon && <Icon size={14} aria-hidden="true" />}
                  <span>{capitalize(line)}</span>
                </p>
              );
            })}
          </div>
        )}

        <div className="share-card-brand">EgoCast</div>
      </div>
    );
  },
);

ShareCard.displayName = 'ShareCard';