import {  openai, createAgent,gemini,grok } from "@inngest/agent-kit";
import {Sandbox}from "@e2b/code-interpreter"

import { inngest } from "./client";
import { getSandbox } from "./utils";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event,step}) => {
    // await step.sleep("wait-a-moment", "1s");
    const sandboxId=await step.run("get-sandbox-id",async()=>{
      const sandbox=await Sandbox.create("vibe-nextjs-ccpp1");
      return sandbox.sandboxId
    })
     const summarizer=createAgent({
      name:"summarizer",
      system: "You are an expert summarizer.  You summarize in 2 words.",
      model:gemini({model:"gemini-1.5-flash"})
    });
        const { output } = await summarizer.run(`Summarize the follwing text:${event.data.value}`);
        const  sandboxUrl=await step.run("get-sandbox-url",async()=>{
          const sandbox=getSandbox(sandboxId);
          const host=(await sandbox).getHost(3000);
          return `https://${host}`
        })

    // return { message: `Hello ${event.data.value}!` };
    return {output,sandboxUrl}
  },
);