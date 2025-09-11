"use client";
import React, { useEffect, useCallback, useState } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import InputFieldCustom from "@/components/form/input/InputFieldCustom";
import Label from "@/components/form/Label";
import SelectCustom from "@/components/form/SelectCustom";
import AddressLookup from "@/components/form/AddressLookup";
import { useUpdateCustomerMutation } from "@/lib/services/customersApi";
import { customerSchema, type CustomerFormData } from "@/lib/validators/customerValidator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Account, AccountStatus, Address, Location } from "@/types/customers";
import { useGetAllRoutesQuery } from "@/lib/services/routesApi";

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Account | null;
}

export default function CustomerModal({ isOpen, onClose, customer }: CustomerModalProps) {
  const [selectedRoute, setSelectedRoute] = useState<number | ''>('');
  const [updateCustomer, { isLoading: isUpdating }] = useUpdateCustomerMutation();
  const { data: routes, isLoading: isLoadingRoutes } = useGetAllRoutesQuery({ pageNumber: 1, pageSize: 20 });

  const routeOptions = routes?.data.map(route => ({ value: String(route.id), label: route.name })) || [];

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
  });

  const statusOptions = [
    { value: AccountStatus.Active, label: "Active" },
    { value: AccountStatus.InfoCompleted, label: "Info Completed" },
    { value: AccountStatus.Inactive, label: "Inactive" },
  ];

  const onAddressSelected = useCallback((address: Partial<Address>, location: Partial<Location>) => {
    setValue("address.line1", address.line1 || '', { shouldValidate: true });
    setValue("address.line2", address.line2 || '', { shouldValidate: true });
    setValue("address.line3", address.line3 || '', { shouldValidate: true });
    setValue("address.postcode", address.postcode || '', { shouldValidate: true });
    setValue("location.latitude", location.latitude, { shouldValidate: true });
    setValue("location.longitude", location.longitude, { shouldValidate: true });
  }, [setValue]);

  useEffect(() => {
    if (customer && isOpen) {
      reset({
        firstName: customer.firstName || "",
        lastName: customer.lastName || "",
        email: customer.email || "",
        telephone: customer.telephone || "",
        allergens: customer.allergens || "",
        status: customer.status || AccountStatus.Active,
        routeId: customer.routeId || 0,
        address: {
          line1: customer.address?.line1 || "",
          line2: customer.address?.line2 || "",
          line3: customer.address?.line3 || "",
          postcode: customer.address?.postcode || "",
          safePlace: customer.address?.safePlace || "",
        },
        location: {
          latitude: customer.location?.latitude,
          longitude: customer.location?.longitude,
        },
      });
      setSelectedRoute(customer.routeId || ''); 
    }
  }, [customer, isOpen, reset]);

  const onSubmit = async (data: CustomerFormData) => {
    if (!customer) return;
    try {
      await updateCustomer({ id: customer.id, ...data, routeId: selectedRoute }).unwrap();
      onClose();
    } catch (error) {
      console.error("Failed to update customer:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[700px] p-5 lg:p-10">
      <form key={customer ? customer.id : 'empty'} onSubmit={handleSubmit(onSubmit)} noValidate>
        <h4 className="mb-6 text-lg font-medium text-gray-800 dark:text-white/90">Edit Customer</h4>
        <div className="max-h-[65vh] overflow-y-auto pr-6 custom-scrollbar">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><Label htmlFor="firstName">First Name</Label><InputFieldCustom id="firstName" {...register("firstName")} error={!!errors.firstName} hint={errors.firstName?.message} /></div>
              <div><Label htmlFor="lastName">Last Name</Label><InputFieldCustom id="lastName" {...register("lastName")} error={!!errors.lastName} hint={errors.lastName?.message} /></div>
              <div><Label htmlFor="email">Email</Label><InputFieldCustom id="email" type="email" {...register("email")} error={!!errors.email} hint={errors.email?.message} /></div>
              <div><Label htmlFor="telephone">Telephone</Label><InputFieldCustom id="telephone" {...register("telephone")} error={!!errors.telephone} hint={errors.telephone?.message} /></div>
            </div>
            <div><Label htmlFor="allergens">Allergens</Label><InputFieldCustom id="allergens" {...register("allergens")} error={!!errors.allergens} hint={errors.allergens?.message} /></div>

            <hr className="dark:border-strokedark" />

            <div><Label>Address Lookup</Label><AddressLookup onAddressSelected={onAddressSelected} /></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><Label htmlFor="address.line1">Address Line 1</Label><InputFieldCustom id="address.line1" {...register("address.line1")} error={!!errors.address?.line1} hint={errors.address?.line1?.message} /></div>
              <div><Label htmlFor="address.line2">Address Line 2</Label><InputFieldCustom id="address.line2" {...register("address.line2")} error={!!errors.address?.line2} hint={errors.address?.line2?.message} /></div>
              <div><Label htmlFor="address.line3">City</Label><InputFieldCustom id="address.line3" {...register("address.line3")} error={!!errors.address?.line3} hint={errors.address?.line3?.message} /></div>
              <div><Label htmlFor="address.postcode">Postcode</Label><InputFieldCustom id="address.postcode" {...register("address.postcode")} error={!!errors.address?.postcode} hint={errors.address?.postcode?.message} /></div>
              <div><Label htmlFor="location.latitude">Latitude</Label><InputFieldCustom id="location.latitude" type="number" step="any" {...register("location.latitude", { valueAsNumber: true })} error={!!errors.location?.latitude} hint={errors.location?.latitude?.message} disabled /></div>
              <div><Label htmlFor="location.longitude">Longitude</Label><InputFieldCustom id="location.longitude" type="number" step="any" {...register("location.longitude", { valueAsNumber: true })} error={!!errors.location?.longitude} hint={errors.location?.longitude?.message} disabled /></div>
            </div>
            <div><Label htmlFor="address.safePlace">Safe Place Instructions</Label><InputFieldCustom id="address.safePlace" {...register("address.safePlace")} error={!!errors.address?.safePlace} hint={errors.address?.safePlace?.message} /></div>

            <div>
              <Label htmlFor="route">Route</Label>
              <SelectCustom
                id="route"
                options={routeOptions}
                value={selectedRoute}
                onChange={(e) => setSelectedRoute(Number(e.target.value))}
                disabled={isLoadingRoutes}
              />
            </div>

            <hr className="dark:border-strokedark" />

            <div>
              <Label htmlFor="status">Status</Label>
              <SelectCustom id="status" options={statusOptions} {...register("status")} error={!!errors.status} hint={errors.status?.message} />
            </div>
          </div>

          <div className="flex items-center justify-end w-full gap-3 mt-6">
            <Button size="sm" variant="outline" onClick={onClose}>Cancel</Button>
            <Button size="sm" disabled={isUpdating}>
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}