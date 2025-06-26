import { auth } from "@/lib/auth";

const handler = (req: Request) => auth.handler(req);

export const GET = handler;
export const POST = handler;
