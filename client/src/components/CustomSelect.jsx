import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const CustomSelect = ({
  options = [],          // [{ value: '', label: '' }, ...]
  value = '',
  onChange,
  placeholder = 'Select...',
  disabled = false,
  variant = 'default',   // 'default' | 'pill' (for filter bars)
  icon = null,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);
  const searchRef = useRef(null);

  const selectedOption = options.find(o => o.value === value);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Focus search when opened
  useEffect(() => {
    if (isOpen && searchRef.current && options.length > 6) {
      searchRef.current.focus();
    }
  }, [isOpen]);

  const filteredOptions = search
    ? options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
    setSearch('');
  };

  const isPill = variant === 'pill';

  return (
    <div className={`cselect ${isPill ? 'cselect-pill' : ''} ${isOpen ? 'open' : ''} ${disabled ? 'disabled' : ''} ${className}`} ref={ref}>
      <button
        type="button"
        className="cselect-trigger"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        {icon && <span className="cselect-icon">{icon}</span>}
        <span className={`cselect-value ${!selectedOption ? 'placeholder' : ''}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={isPill ? 14 : 16} className={`cselect-arrow ${isOpen ? 'rotated' : ''}`} />
      </button>

      {isOpen && (
        <div className="cselect-dropdown">
          {/* Search field for long lists */}
          {options.length > 6 && (
            <div className="cselect-search">
              <input
                ref={searchRef}
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}

          <div className="cselect-options">
            {filteredOptions.length === 0 ? (
              <div className="cselect-empty">No results found</div>
            ) : (
              filteredOptions.map(option => (
                <button
                  type="button"
                  key={option.value}
                  className={`cselect-option ${value === option.value ? 'selected' : ''}`}
                  onClick={() => handleSelect(option.value)}
                >
                  <span>{option.label}</span>
                  {value === option.value && <Check size={14} className="cselect-check" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
