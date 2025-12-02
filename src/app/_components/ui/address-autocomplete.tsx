'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

// Full address suggestion with coordinates
export type AddressSuggestion = {
    fulltext: string;
    city: string;
    zipcode: string;
    longitude: number;
    latitude: number;
};

type AddressAutocompleteProps = {
    id: string;
    value: string;
    onChange: (value: string) => void;
    onSelect: (suggestion: AddressSuggestion) => void;
    placeholder?: string;
    hasError?: boolean;
    className?: string;
    // 'city' = shows only unique cities, 'address' = shows full addresses
    mode?: 'city' | 'address';
};

const GEOPLATEFORME_API = 'https://data.geopf.fr/geocodage/completion';

const fetchSuggestions = async (
    text: string,
    mode: 'city' | 'address',
): Promise<AddressSuggestion[]> => {
    if (text.length < 2) return [];
    const url = `${GEOPLATEFORME_API}?text=${encodeURIComponent(
        text,
    )}&type=StreetAddress,PositionOfInterest&maximumResponses=10`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();

    const results = (data.results || []).map(
        (r: { fulltext: string; city: string; zipcode?: string; x: number; y: number }) => ({
            fulltext: r.fulltext,
            city: r.city || '',
            zipcode: r.zipcode || '',
            longitude: r.x,
            latitude: r.y,
        }),
    );

    if (mode === 'city') {
        // Extract unique cities
        const citiesMap = new Map<string, AddressSuggestion>();
        results.forEach((r: AddressSuggestion) => {
            if (r.city && !citiesMap.has(r.city)) {
                citiesMap.set(r.city, r);
            }
        });
        return Array.from(citiesMap.values()).slice(0, 5);
    }

    return results.slice(0, 5);
};

export const AddressAutocomplete = ({
    id,
    value,
    onChange,
    onSelect,
    placeholder = 'Rechercher...',
    hasError = false,
    className = '',
    mode = 'address',
}: AddressAutocompleteProps) => {
    const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState(value);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const debouncedFetch = useCallback(
        async (text: string) => {
            const results = await fetchSuggestions(text, mode);
            setSuggestions(results);
            setIsOpen(results.length > 0);
        },
        [mode],
    );

    useEffect(() => {
        const timer = setTimeout(() => debouncedFetch(inputValue), 300);
        return () => clearTimeout(timer);
    }, [inputValue, debouncedFetch]);

    useEffect(() => {
        setInputValue(value);
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (suggestion: AddressSuggestion) => {
        const displayValue = mode === 'city' ? suggestion.city : suggestion.fulltext;
        setInputValue(displayValue);
        onChange(displayValue);
        onSelect(suggestion);
        setIsOpen(false);
        setSuggestions([]);
    };

    const handleInputChange = (val: string) => {
        setInputValue(val);
        onChange(val);
    };

    const baseInputClass =
        'w-full border rounded-lg focus:ring-2 focus:ring-[var(--pink)] focus:border-transparent text-sm';
    const errorClass = hasError ? 'border-red-500' : 'border-gray-300';

    return (
        <div ref={wrapperRef} className="relative">
            <input
                type="text"
                id={id}
                autoComplete="off"
                value={inputValue}
                onChange={(e) => handleInputChange(e.target.value)}
                onFocus={() => suggestions.length > 0 && setIsOpen(true)}
                className={`${baseInputClass} ${errorClass} px-3 py-2.5 ${className}`}
                placeholder={placeholder}
            />
            {isOpen && suggestions.length > 0 && (
                <ul className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg mt-1 shadow-lg max-h-48 overflow-auto">
                    {suggestions.map((s, i) => (
                        <li
                            key={i}
                            onClick={() => handleSelect(s)}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                        >
                            {mode === 'city' ? (
                                <>
                                    <span className="font-medium">{s.city}</span>
                                    {s.zipcode && (
                                        <span className="text-gray-500 ml-2">({s.zipcode})</span>
                                    )}
                                </>
                            ) : (
                                s.fulltext
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
