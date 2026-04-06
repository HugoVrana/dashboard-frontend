"use client"

import {Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label} from "@hugovrana/dashboard-frontend-shared";
import {Plus} from "lucide-react";
import {useDebugTranslations} from "@/app/shared/contexts/translations/useDebugTranslations";

type Props = {
    name: string;
    description: string;
    busy: boolean;
    onNameChange: (value: string) => void;
    onDescriptionChange: (value: string) => void;
    onSubmit: (formData: FormData) => Promise<void>;
};

export default function CreateGrantCard({
    name,
    description,
    busy,
    onNameChange,
    onDescriptionChange,
    onSubmit,
}: Props) {
    const t = useDebugTranslations("dashboard.roles");
    return (
        <Card className="border-slate-200/80 dark:border-slate-800">
            <CardHeader>
                <CardTitle>{t("createGrant.title")}</CardTitle>
                <CardDescription>{t("createGrant.description")}</CardDescription>
            </CardHeader>
            <CardContent>
                <form action={onSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="grant-create-name">{t("createGrant.nameLabel")}</Label>
                        <Input
                            id="grant-create-name"
                            name="name"
                            value={name}
                            onChange={(event) => onNameChange(event.target.value)}
                            placeholder={t("createGrant.namePlaceholder")}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="grant-create-description">{t("createGrant.descriptionLabel")}</Label>
                        <Input
                            id="grant-create-description"
                            name="description"
                            value={description}
                            onChange={(event) => onDescriptionChange(event.target.value)}
                            placeholder={t("createGrant.descriptionPlaceholder")}
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={busy}>
                        <Plus className="mr-2 size-4" />
                        {busy ? t("createGrant.submitting") : t("createGrant.submit")}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
