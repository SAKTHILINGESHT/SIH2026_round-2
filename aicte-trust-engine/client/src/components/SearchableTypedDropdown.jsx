import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, X } from 'lucide-react';

/**
 * SearchableTypedDropdown (Officer Scrutiny Cockpit version)
 * Clean combobox: click shows all, typing filters to matched only, no intrusive extra banners.
 */
export const SearchableTypedDropdown = ({
  value = '',
  onChange,
  options = [],
  placeholder = 'Select or type custom...',
  label,
  required = false,
  disabled = false,
  className = '',
  inputClassName = '',
  helperText,
  name,
  id
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value || '');
  const [isTyping, setIsTyping] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setSearchTerm(value || '');
  }, [value]);

  const normalizedOptions = options.map(opt => {
    if (typeof opt === 'string') {
      return { value: opt, label: opt, group: null, badge: null };
    }
    return {
      value: opt.value || opt.label || '',
      label: opt.label || opt.value || '',
      group: opt.group || null,
      badge: opt.badge || null
    };
  });

  const displayedOptions = (isTyping && (searchTerm || '').trim())
    ? normalizedOptions.filter(opt =>
        opt.label.toLowerCase().includes((searchTerm || '').toLowerCase()) ||
        opt.value.toLowerCase().includes((searchTerm || '').toLowerCase())
      )
    : normalizedOptions;

  const handleInputChange = (e) => {
    const newVal = e.target.value;
    setSearchTerm(newVal);
    setIsTyping(true);
    setHighlightedIndex(-1);
    setIsOpen(true);
    if (onChange) {
      onChange(newVal);
    }
  };

  const handleToggleDropdown = () => {
    if (disabled) return;
    setIsTyping(false);
    setIsOpen(prev => !prev);
  };

  const handleSelectOption = (optValue) => {
    setSearchTerm(optValue);
    setIsTyping(false);
    setIsOpen(false);
    if (onChange) {
      onChange(optValue);
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setSearchTerm('');
    setIsTyping(false);
    if (onChange) {
      onChange('');
    }
    inputRef.current?.focus();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setIsTyping(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e) => {
    if (disabled) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsTyping(false);
        setIsOpen(true);
      } else {
        setHighlightedIndex(prev => 
          prev < displayedOptions.length - 1 ? prev + 1 : 0
        );
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsTyping(false);
        setIsOpen(true);
      } else {
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : displayedOptions.length - 1
        );
      }
    } else if (e.key === 'Enter') {
      if (isOpen && highlightedIndex >= 0 && highlightedIndex < displayedOptions.length) {
        e.preventDefault();
        handleSelectOption(displayedOptions[highlightedIndex].value);
      } else if (isOpen) {
        setIsOpen(false);
        setIsTyping(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setIsTyping(false);
    }
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
          <span>{label} {required && <span className="text-rose-500">*</span>}</span>
        </label>
      )}

      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          id={id}
          name={name}
          required={required}
          disabled={disabled}
          value={searchTerm}
          onChange={handleInputChange}
          onClick={() => {
            if (!disabled && !isOpen) {
              setIsTyping(false);
              setIsOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          className={`w-full p-2.5 pr-14 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 font-medium text-xs text-slate-900 transition-all placeholder:text-slate-400 disabled:opacity-70 disabled:cursor-not-allowed ${inputClassName}`}
        />

        <div className="absolute right-2 flex items-center gap-1">
          {searchTerm && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
              title="Clear text"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            disabled={disabled}
            onClick={handleToggleDropdown}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed"
            title="Toggle dropdown list"
          >
            <ChevronDown 
              className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180 text-indigo-600' : ''}`} 
            />
          </button>
        </div>
      </div>

      {isOpen && !disabled && displayedOptions.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl max-h-64 overflow-y-auto animate-in fade-in-50 zoom-in-95 duration-100 p-1 space-y-0.5">
          {displayedOptions.map((opt, idx) => {
            const isSelected = value === opt.value;
            const isHighlighted = highlightedIndex === idx;

            return (
              <button
                key={`${opt.value}-${idx}`}
                type="button"
                onClick={() => handleSelectOption(opt.value)}
                onMouseEnter={() => setHighlightedIndex(idx)}
                className={`w-full text-left px-3 py-2 text-xs rounded-lg flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                  isSelected 
                    ? 'bg-indigo-50 text-indigo-950 font-bold' 
                    : isHighlighted 
                    ? 'bg-slate-100 text-slate-900 font-medium' 
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex flex-col min-w-0 pr-2">
                  <span className="truncate">{opt.label}</span>
                  {opt.group && (
                    <span className="text-[10px] text-slate-400 font-normal">
                      {opt.group}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {opt.badge && (
                    <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono font-medium">
                      {opt.badge}
                    </span>
                  )}
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {helperText && (
        <p className="text-[11px] text-slate-500 mt-1">{helperText}</p>
      )}
    </div>
  );
};

export default SearchableTypedDropdown;
