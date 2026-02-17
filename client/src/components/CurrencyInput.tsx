/**
 * CurrencyInput Component
 * Design: Warm Professional — Organic Modernism
 * Formatted currency input with R$ prefix
 */

import { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export default function CurrencyInput({
  value,
  onChange,
  placeholder = '0,00',
  className = '',
  disabled = false,
}: CurrencyInputProps) {
  const [focused, setFocused] = useState(false);
  const [displayValue, setDisplayValue] = useState('');

  const formatForDisplay = (num: number): string => {
    if (num === 0) return '';
    return num.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleFocus = () => {
    setFocused(true);
    setDisplayValue(value > 0 ? value.toString().replace('.', ',') : '');
  };

  const handleBlur = () => {
    setFocused(false);
    const parsed = parseFloat(displayValue.replace(/\./g, '').replace(',', '.'));
    if (!isNaN(parsed)) {
      onChange(parsed);
    } else if (displayValue === '') {
      onChange(0);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Allow only numbers, comma and dot
    const cleaned = raw.replace(/[^\d.,]/g, '');
    setDisplayValue(cleaned);
  };

  return (
    <div className={`relative ${className}`}>
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-mono font-medium">
        R$
      </span>
      <Input
        type="text"
        inputMode="decimal"
        value={focused ? displayValue : formatForDisplay(value)}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        className="pl-10 font-mono text-right currency-input"
      />
    </div>
  );
}
