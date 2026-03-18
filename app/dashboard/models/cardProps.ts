import {CardType} from "@/app/dashboard/models/cardType";
import {SkeletonProps} from "@/app/dashboard/models/skeletonProps";

export type CardProps = {
    hasPermission : boolean;
    title : string;
    value : number | string;
    type : CardType;
    skeletonProps : SkeletonProps;
}

