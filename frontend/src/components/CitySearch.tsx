import { useState } from 'react';
import { useCitySearch } from '../hooks/useCitySearch';
import type { CityResult, Coordinates } from '../types/weather';

interface CitySearchProps {
  onSelect: (coords: Coordinates, label: string) => void;
  onBack?: () => void;
}

export function CitySearch({ onSelect, onBack }: CitySearchProps) {
  const [query, setQuery] = useState('');
  const { results, status } = useCitySearch(query);

  function handleSelect(city: CityResult) {
    const label = `${city.name}, ${city.country}`;
    onSelect({ lat: city.latitude, lon: city.longitude }, label);
    setQuery(label);
  }

  return (
    <div className="city-search">
      {onBack && (
        <button type="button" className="city-search-back" onClick={onBack}>
          ← Back
        </button>
      )}

      <input
        type="text"
        className="city-search-input"
        placeholder="Type a city name..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {status === 'loading' && <p className="city-search-hint">Searching...</p>}

      {status === 'success' && results.length === 0 && (
        <p className="city-search-hint">No cities found.</p>
      )}

      {results.length > 0 && (
        <ul className="city-search-results">
          {results.map((city) => (
            <li key={city.id}>
              <button type="button" onClick={() => handleSelect(city)}>
                {city.name}
                {city.admin1 ? `, ${city.admin1}` : ''}, {city.country}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}