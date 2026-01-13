import {CardType} from "@/app/models/ui/cardType";
import {SkeletonProps} from "@/app/models/ui/skeletonProps";

export type CardProps = {
    hasPermission : boolean;
    title : string;
    value : number | string;
    type : CardType;
    skeletonProps : SkeletonProps;
}

