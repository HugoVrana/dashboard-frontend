import {Avatar, AvatarFallback, AvatarImage} from "@hugovrana/dashboard-frontend-shared";
import {CustomerRead} from "@/app/dashboard/models/customerRead";

type Props = {
    customer: CustomerRead;
    size?: "sm" | "md" | "lg";
    className?: string;
}

export default function CustomerAvatar({customer, className}: Props) {
    return (
        <Avatar className={className}>
            {customer.image_url && (
                <AvatarImage src={customer.image_url} alt={customer.name} />
            )}
            <AvatarFallback>
                {customer.name
                    .split(' ')
                    .map(word => word[0])
                    .join('')
                    .toUpperCase()}
            </AvatarFallback>
        </Avatar>
    );
}
