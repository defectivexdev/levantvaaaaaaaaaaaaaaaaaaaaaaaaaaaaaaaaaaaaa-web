import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest";
import { cleanupStaleData } from "@/inngest/functions";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    cleanupStaleData,
  ],
});
