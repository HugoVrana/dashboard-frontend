export type InitiatePkceResult =
    | { status: "success"; requestId: string }
    | { status: "error"; message: string };
