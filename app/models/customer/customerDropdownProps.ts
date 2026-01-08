import {CustomerRead} from "./customerRead";

export type CustomerDropdownProps = {
    hasPermission  : boolean;
    customers: CustomerRead[];
    className?: string;
    defaultValue?: string; // Add this to accept the customer_id for editing
};