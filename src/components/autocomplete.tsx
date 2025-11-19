import React, { useState, useMemo, useRef } from 'react';
import { Loader2, X } from 'lucide-react'; // Import 'X' icon
import InputFieldCustom from './form/input/InputFieldCustom';

// --- Component Types ---

interface Option {
    value: number | string;
    label: string;
}

interface AutocompleteProps {
    label: string;
    name: string;
    value: Option | null;
    options: Option[];
    onChange: (selected: Option | null) => void;
    inputValue: string;
    onInputValueChange: (inputValue: string) => void;
    placeholder?: string;
    required?: boolean;
    isLoading?: boolean;
}

const Autocomplete: React.FC<AutocompleteProps> = ({
    label,
    name,
    value,
    options,
    onChange,
    inputValue,
    onInputValueChange,
    placeholder = 'Search...',
    required,
    isLoading = false,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null); // Ref for focusing

    const filteredOptions = useMemo(() => {
        if (!inputValue) return options;
        return options.filter(option =>
            option.label.toLowerCase().includes(inputValue.toLowerCase())
        ).slice(0, 50);
    }, [inputValue, options]);

    const handleSelect = (option: Option) => {
        onChange(option);
        setIsOpen(false);
    };

    const handleLocalInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        
        onInputValueChange(newValue);
        setIsOpen(true);

        if (newValue === '') {
            onChange(null);
        }
    };
    
    const handleClear = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent form submission if inside a form
        e.stopPropagation(); // Stop event from propagating (e.g., preventing blur)
        
        onInputValueChange(''); // Clear the search input value
        onChange(null); // Clear the selected value (accountId)
        setIsOpen(false);
        
        // Focus the input after clearing
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }

    const handleBlur = () => {
        setTimeout(() => setIsOpen(false), 200);
    };

    const displayValue = useMemo(() => {
        if (value) {
            return value.label;
        }
        return inputValue;
    }, [value, inputValue]);

    return (
        <div className="relative">
            {label && <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{label}{required ? <span className="text-red-500">*</span> : ''}</label>}
            
            <div className="relative"> {/* Wrapper for input and clear button */}
                <InputFieldCustom
                    ref={inputRef} // Attach ref here
                    name={name + '-search'}
                    placeholder={placeholder}
                    value={displayValue}
                    onChange={handleLocalInputChange}
                    onFocus={() => setIsOpen(true)}
                    onBlur={handleBlur} 
                />
                
                {/* Clear Button (Visible if there is text or a selected value) */}
                {(displayValue || isLoading) && (
                    <div className={`absolute right-0 top-1/2 -mt-2.5 flex items-center pr-3 ${isLoading ? 'space-x-2' : ''}`}>
                         {isLoading && (
                            <Loader2 className="w-4 h-4 animate-spin text-theme-primary" />
                         )}
                         {(!!displayValue && !isLoading) && (
                            <button
                                type="button"
                                onClick={handleClear}
                                aria-label="Clear search"
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                <X className="w-4 h-4" />
                            </button>
                         )}
                    </div>
                )}
            </div>

            {isOpen && filteredOptions.length > 0 && (
                <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto dark:bg-gray-800 dark:border-gray-600">
                    {filteredOptions.map((option) => (
                        <li
                            key={option.value}
                            className="p-2 cursor-pointer hover:bg-theme-primary/10 dark:hover:bg-theme-primary/20 text-sm text-gray-900 dark:text-gray-100"
                            onMouseDown={() => handleSelect(option)} 
                        >
                            {option.label}
                        </li>
                    ))}
                </ul>
            )}
            
            <input type="hidden" name={name} value={value?.value || ''} />
        </div>
    );
};

export default Autocomplete;