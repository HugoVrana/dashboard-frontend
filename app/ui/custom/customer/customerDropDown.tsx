"use client"

import {CustomerRead} from "@/app/models/customer/customerRead";
import {Select, SelectContent, SelectItem, SelectTrigger,} from "@/app/ui/base/select";

export interface CustomerDropdownProps {
    customers: CustomerRead[];
    value: string;
    onValueChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export function CustomerDropdown({
    customers,
    value,
    onValueChange,
    placeholder = "Select a customer",
    className = "w-full",
}: CustomerDropdownProps) {
    const selectedCustomer = customers.find(c => c.id === value);

    return (
        <Select
            value={value}
            onValueChange={(newValue: string | null) => onValueChange(newValue ?? "")}
        >
            <SelectTrigger className={className}>
                {selectedCustomer ? (
                    <div className="flex items-center gap-2">
                        {selectedCustomer.image_url && (
                            <img
                                src={selectedCustomer.image_url}
                                alt={selectedCustomer.name}
                                className="size-6 rounded-full"
                            />
                        )}
                        <span>{selectedCustomer.name}</span>
                    </div>
                ) : (
                    <span className="text-muted-foreground">{placeholder}</span>
                )}
            </SelectTrigger>
            <SelectContent>
                {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                        <div className="flex items-center gap-2">
                            {customer.image_url && (
                                <img
                                    src={customer.image_url}
                                    alt={customer.name}
                                    className="size-6 rounded-full"
                                />
                            )}
                            <span>{customer.name}</span>
                        </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
