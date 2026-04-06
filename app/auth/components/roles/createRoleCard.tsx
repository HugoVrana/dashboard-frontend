"use client"

import {Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label} from "@hugovrana/dashboard-frontend-shared";
import {Plus} from "lucide-react";
import {useDebugTranslations} from "@/app/shared/contexts/translations/useDebugTranslations";

type Props = {
    createName: string;
    busy: boolean;
    onNameChange: (value: string) => void;
    onSubmit: (formData: FormData) => Promise<void>;
};

export default function CreateRoleCard({createName, busy, onNameChange, onSubmit}: Props) {
    const t = useDebugTranslations("dashboard.roles");
    return (
        <Card className="border-slate-200/80 dark:border-slate-800">
            <CardHeader>
                <CardTitle>{t("create.title")}</CardTitle>
                <CardDescription>{t("create.description")}</CardDescription>
            </CardHeader>
            <CardContent>
                <form action={onSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="role-create-name">{t("fields.name")}</Label>
                        <Input
                            id="role-create-name"
                            name="name"
                            value={createName}
                            onChange={(event) => onNameChange(event.target.value)}
                            placeholder={t("create.placeholder")}
                            required
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={busy}>
                        <Plus className="mr-2 size-4" />
                        {busy ? t("create.submitting") : t("create.submit")}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
