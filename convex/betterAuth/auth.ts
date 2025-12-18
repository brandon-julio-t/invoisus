import { createAuth } from "../auth";

// Export a static instance for Better Auth schema generation
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- follow docs
export const auth = createAuth({} as any);
