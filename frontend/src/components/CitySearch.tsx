import { useState } from 'react';
import { useCitySearch } from '../hooks/useCitySearch';
import type { CityResult, Coordinates } from '../types/weather';

interface CitySearchProps {
  onSelect: (coords: Coordinates) => void;
}

export function CitySearch({ onSelect }: CitySearchProps) {
  const [query, setQuery] = useState('');
  const { results, status } = useCitySearch(query);

  function handleSelect(city: CityResult) {
    onSelect({ lat: city.latitude, lon: city.longitude });
    setQuery(`${city.name}, ${city.country}`);
  }

  return (
    <div className="city-search">
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