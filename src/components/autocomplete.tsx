// components/form/Autocomplete.tsx (Conceptual Component)

import React, { useState, useMemo } from 'react';

import { Loader2 } from 'lucide-react';
import InputField from './form/input/InputField';

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
    placeholder?: string;
    required?: boolean;
    // ... other props
}

const Autocomplete: React.FC<AutocompleteProps> = ({
    label,
    name,
    value,
    options,
    onChange,
    placeholder = 'Search...',
    required,
}) => {
    const [searchTerm, setSearchTerm] = useState(value ? value.label : '');
    const [isOpen, setIsOpen] = useState(false);

    // Filter options based on search term
    const filteredOptions = useMemo(() => {
        if (!searchTerm) return options;
        return options.filter(option =>
            option.label.toLowerCase().includes(searchTerm.toLowerCase())
        ).slice(0, 50); // Limit results for performance
    }, [searchTerm, options]);

    // Update search term when value prop changes (e.g., initial load or form reset)
    React.useEffect(() => {
        setSearchTerm(value ? value.label : '');
    }, [value]);

    const handleSelect = (option: Option) => {
        setSearchTerm(option.label);
        onChange(option);
        setIsOpen(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setIsOpen(true);
        // Clear value if input is cleared
        if (e.target.value === '') {
            onChange(null);
        }
    };

    return (
        <div className="relative">
            {label && <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{label}{required ? <span className="text-red-500">*</span> : ''}</label>}
            
            <InputField
                name={name + '-search'}
                placeholder={placeholder}
                value={searchTerm}
                onChange={handleInputChange}
                onFocus={() => setIsOpen(true)}
                // Delay blur to allow click on option
                onBlur={() => setTimeout(() => setIsOpen(false), 200)} 
            />

            {isOpen && filteredOptions.length > 0 && (
                <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto dark:bg-gray-800 dark:border-gray-600">
                    {filteredOptions.map((option) => (
                        <li
                            key={option.value}
                            className="p-2 cursor-pointer hover:bg-theme-primary/10 dark:hover:bg-theme-primary/20 text-sm text-gray-900 dark:text-gray-100"
                            onMouseDown={() => handleSelect(option)} // Use onMouseDown to trigger before onBlur
                        >
                            {option.label}
                        </li>
                    ))}
                </ul>
            )}
            {/* Display status for debugging */}
            <input type="hidden" name={name} value={value?.value || ''} />
        </div>
    );
};

export default Autocomplete;