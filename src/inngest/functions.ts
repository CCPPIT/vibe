import {  openai, createAgent,gemini,grok } from "@inngest/agent-kit";

import { inngest } from "./client";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event,}) => {
    // await step.sleep("wait-a-moment", "1s");
     const summarizer=createAgent({
      name:"summarizer",
      system: "You are an expert summarizer.  You summarize in 2 words.",
      model:grok({model:"grok-3"})
    });
        const { output } = await summarizer.run(`Summarize the follwing text:${event.data.value}`);

    // return { message: `Hello ${event.data.value}!` };
    return {output}
  },
);