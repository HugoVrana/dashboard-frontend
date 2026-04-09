"use client"

import {Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label} from "@hugovrana/dashboard-frontend-shared";
import {Plus} from "lucide-react";
import {useDebugTranslations} from "@/app/shared/contexts/translations/useDebugTranslations";
import {CreateRoleCardProps} from "@/app/auth/models/components/createRoleCardProps";

export default function CreateRoleCard(props: CreateRoleCardProps) {
    const t = useDebugTranslations("auth.roles");
    return (
        <Card className="border-slate-200/80 dark:border-slate-800">
            <CardHeader>
                <CardTitle>{t("create.title")}</CardTitle>
                <CardDescription>{t("create.description")}</CardDescription>
            </CardHeader>
            <CardContent>
                <form action={props.onSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="role-create-name">{t("fields.name")}</Label>
                        <Input
                            id="role-create-name"
                            name="name"
                            value={props.createName}
                            onChange={(event) => props.onNameChange(event.target.value)}
                            placeholder={t("create.placeholder")}
                            required
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={props.busy}>
                        <Plus className="mr-2 size-4" />
                        {props.busy ? t("create.submitting") : t("create.submit")}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
