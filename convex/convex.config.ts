import r2 from "@convex-dev/r2/convex.config";
import workflow from "@convex-dev/workflow/convex.config";
import { defineApp } from "convex/server";

const app = defineApp();

app.use(r2);
app.use(workflow);

export default app;
