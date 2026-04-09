"use client"

import {Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label} from "@hugovrana/dashboard-frontend-shared";
import {Plus} from "lucide-react";
import {useDebugTranslations} from "@/app/shared/contexts/translations/useDebugTranslations";
import {CreateGrantCardProps} from "@/app/auth/models/components/crateGrantCardProps";

export default function CreateGrantCard(props: CreateGrantCardProps) {
    const t = useDebugTranslations("auth.roles");
    return (
        <Card className="border-slate-200/80 dark:border-slate-800">
            <CardHeader>
                <CardTitle>{t("createGrant.title")}</CardTitle>
                <CardDescription>{t("createGrant.description")}</CardDescription>
            </CardHeader>
            <CardContent>
                <form action={props.onSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="grant-create-name">{t("createGrant.nameLabel")}</Label>
                        <Input
                            id="grant-create-name"
                            name="name"
                            value={props.name}
                            onChange={(event) => props.onNameChange(event.target.value)}
                            placeholder={t("createGrant.namePlaceholder")}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="grant-create-description">{t("createGrant.descriptionLabel")}</Label>
                        <Input
                            id="grant-create-description"
                            name="description"
                            value={props.description}
                            onChange={(event) => props.onDescriptionChange(event.target.value)}
                            placeholder={t("createGrant.descriptionPlaceholder")}
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={props.busy}>
                        <Plus className="mr-2 size-4" />
                        {props.busy ? t("createGrant.submitting") : t("createGrant.submit")}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
