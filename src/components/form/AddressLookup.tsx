"use client";
import React, { useState } from 'react';
import InputFieldCustom from './input/InputFieldCustom';
import { useLazyAutocompleteAddressQuery, useLazyGetAddressDetailsQuery } from '@/lib/services/addressApi';
import { Address, Location } from '@/types/customers';

interface AddressLookupProps {
  onAddressSelected: (address: Partial<Address>, location: Partial<Location>) => void;
}

const AddressLookup: React.FC<AddressLookupProps> = ({ onAddressSelected }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [triggerAutocomplete, { data: suggestions, isFetching }] = useLazyAutocompleteAddressQuery();
  const [triggerGetDetails] = useLazyGetAddressDetailsQuery();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term.length > 2) {
      triggerAutocomplete(term);
    }
  };

  const handleSelectAddress = async (id: string) => {
        try {
          const details = await triggerGetDetails(id).unwrap();
          onAddressSelected(
            {
              line1: details.line_1,
              line2: details.line_2,
              line3: details.town_or_city,
              postcode: details.postcode,
            },
            {
              latitude: details.latitude,
              longitude: details.longitude,
            }
          );
          setSearchTerm('');
        } catch (error) {
          console.error("Failed to get address details", error);
        }
    };

  return (
    <div className="relative">
      <InputFieldCustom
        id="address-search"
        type="text"
        placeholder="Start typing an address or postcode..."
        value={searchTerm}
        onChange={handleSearchChange}
      />
      {isFetching && <div className="p-2">Searching...</div>}
      {suggestions && searchTerm && (
        <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-md mt-1 shadow-lg dark:bg-boxdark dark:border-strokedark">
          {suggestions.map((s) => (
            <li
              key={s.id}
              className="p-2 hover:bg-gray-100 dark:hover:bg-meta-4 cursor-pointer"
              onClick={() => handleSelectAddress(s.id)}
            >
              {s.address}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AddressLookup;