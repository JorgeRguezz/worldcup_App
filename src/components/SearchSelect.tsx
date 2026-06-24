import { useEffect, useMemo, useRef, useState } from 'react';

type SearchSelectProps = {
  disabled?: boolean;
  label: string;
  options: readonly string[];
  placeholder: string;
  points?: number;
  value: string;
  onChange: (value: string) => void;
};

function normalizeSearchValue(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase('es-ES')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function SearchSelect({ disabled = false, label, options, placeholder, points, value, onChange }: SearchSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const mobileInputRef = useRef<HTMLInputElement | null>(null);
  const listboxId = `${normalizeSearchValue(label).replace(/\s+/g, '-')}-options`;

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    if (!isOpen) return;

    if (window.matchMedia('(max-width: 900px)').matches) {
      window.setTimeout(() => mobileInputRef.current?.focus(), 50);
    }

    const onPointerDown = (event: PointerEvent) => {
      if (wrapperRef.current?.contains(event.target as Node)) return;
      setIsOpen(false);
    };

    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [isOpen]);

  const filteredOptions = useMemo(() => {
    const normalizedQuery = normalizeSearchValue(query);
    if (!normalizedQuery) return options.slice(0, 24);

    return options.filter((option) => normalizeSearchValue(option).includes(normalizedQuery)).slice(0, 24);
  }, [options, query]);

  const chooseOption = (option: string) => {
    setQuery(option);
    onChange(option);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const updateQuery = (nextQuery: string) => {
    setQuery(nextQuery);
    onChange(nextQuery);
    setIsOpen(true);
  };

  return (
    <div className={`search-select${isOpen ? ' search-select--open' : ''}`} ref={wrapperRef}>
      <label>
        <span>
          {label} {points ? <b>+{points} pts</b> : null}
        </span>
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          disabled={disabled}
          autoComplete="off"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          onFocus={() => setIsOpen(true)}
          onClick={() => setIsOpen(true)}
          onChange={(event) => {
            updateQuery(event.target.value);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') setIsOpen(false);
            if (event.key === 'ArrowDown') setIsOpen(true);
          }}
        />
      </label>

      {isOpen && !disabled ? (
        <>
          <button className="search-select__backdrop" type="button" aria-label="Cerrar selector" onClick={() => setIsOpen(false)} />
          <div className="search-select__menu" id={listboxId} role="listbox">
            <div className="search-select__mobile-heading">
              <strong>{label}</strong>
              <button type="button" onClick={() => setIsOpen(false)}>
                Cerrar
              </button>
            </div>
            <input
              className="search-select__mobile-input"
              ref={mobileInputRef}
              type="text"
              placeholder={placeholder}
              value={query}
              autoComplete="off"
              onChange={(event) => updateQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Escape') setIsOpen(false);
              }}
            />
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  className="search-select__option"
                  type="button"
                  role="option"
                  aria-selected={option === value}
                  key={option}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => chooseOption(option)}
                >
                  {option}
                </button>
              ))
            ) : (
              <p className="search-select__empty">No hay resultados.</p>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
