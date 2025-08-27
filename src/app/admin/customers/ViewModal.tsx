import React from 'react';
import { Modal } from '@/components/ui/modal';

import Button from '@/components/ui/button/Button';
import { Account } from '@/types/customers';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  customer: Account | null;
}

const CustomerViewModal: React.FC<Props> = ({ isOpen, onClose, customer }) => {
  if (!customer) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="View Customer">
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold">Personal Information</h4>
            <p><strong>Name:</strong> {customer.firstName} {customer.lastName}</p>
            <p><strong>Email:</strong> {customer.email}</p>
            <p><strong>Telephone:</strong> {customer.telephone || 'N/A'}</p>
          </div>
          <div>
            <h4 className="font-semibold">Address</h4>
            <p>{customer.address?.line1}</p>
            {customer.address?.line2 && <p>{customer.address.line2}</p>}
            <p>{customer.address?.line3}, {customer.address?.postcode}</p>
          </div>
          <div>
            <h4 className="font-semibold">Details</h4>
            <p><strong>Status:</strong> {customer.status}</p>
            <p><strong>Allergens:</strong> {customer.allergens || 'None'}</p>
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </Modal>
  );
};

export default CustomerViewModal;