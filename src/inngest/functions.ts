import {  openai, createAgent,gemini,grok,anthropic ,createTool, createNetwork} from "@inngest/agent-kit";
import {Sandbox}from "@e2b/code-interpreter"
import { z, ZodObject } from "zod";

import { inngest } from "./client";
import { getSandbox, lastAssistantTextMessageContent } from "./utils";
import { PROMPT1 } from "@/prompt/prompt1";
import { PROMPT3 } from "@/prompt/prompt3";
import { PROMPT2 } from "@/prompt/prompt2";



export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event,step}) => {
    // await step.sleep("wait-a-moment", "1s");
    const sandboxId=await step.run("get-sandbox-id",async()=>{
      const sandbox=await Sandbox.create("vibe-nextjs-ccpp1");
      return sandbox.sandboxId
    })
    const codeAgent = createAgent({
      name: "code-agent",
      description: "An expert coding agent",  // ✅ تصحيح إملائي
      system: PROMPT1,
      model: gemini({
        model: "gemini-1.5-flash",  // 🆓 مجاني ضمن الحدود
      
      }),
      
      tools:[
        createTool({
          name:"terminal",
          description:"Use the terminal to run commands",
          parameters: z.object({
           command:z.string(),

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          })as any,
          handler:async({command},{step})=>{
            return await step?.run("terminal",async()=>{
              const buffers={stdout:"",stderr:""};
              try{
                const sandbox=await getSandbox(sandboxId)
                const result=await sandbox.commands.run(command,{
                  onStdout:(data:string)=>{
                    buffers.stdout+=data;
                  },
                  onStderr:(data:string)=>{
                    buffers.stderr+=data
                  }
                })
                return result.stdout

              }catch(e){
                console.error(
                  `Command failed:${e}\nstdout:${buffers.stdout}\nstderr:${buffers.stderr}`
                );
                return`Command failed:${e}\nstdout:${buffers.stdout}\nstderr:${buffers.stderr}`


              }

            })
          },
        
        
        }),
        createTool({
          name:"createOrUpdateFiles",
          description:"Create or update files in the sandbox",
          parameters:z.object({
            files:z.array(
              z.object({
                path:z.string(),
                content:z.string()
              })
            )
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          })as any,
          handler:async({files},{step,network})=> {

              const newFiles=await step?.run("createOrUpdateFiles",async()=>{
                try{
                  const updatedFiles=network.state.data.files||{}
                  const sandbox=await getSandbox(sandboxId)
                  for (const file of files){
                    await sandbox.files.write(file.path,file.content);
                    updatedFiles[file.path]=file.content;
                  }
                  return updatedFiles

                }catch(e){
                  return "Error" +e;

                }
              });
              if(typeof newFiles==="object"){
                network.state.data.files=newFiles;
              }
          },
        }),
        createTool({
          name:"readFiles",
          description:"Read files from the sandbox",
          parameters:z.object({
            files:z.array(z.string())
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          })as any,
          handler:async({files},{step})=>{
            return await step?.run("readFiles",async()=>{
              try{
                const sandbox=await getSandbox(sandboxId);
                const contents=[];
                for(const file of files){
                  const content=await sandbox.files.read(file)
                  contents.push({path:file,content})
                }
                return JSON.stringify(contents)

              }catch(e){
                return "Error:"+e;

              }
            })

          }
        })
        
      ],
      lifecycle:{
        onResponse:async({result,network})=>{
          const lastAssistantMessageText=
          lastAssistantTextMessageContent(result);
          if(lastAssistantMessageText&& network){
            if(lastAssistantMessageText.includes("<task_summary>")){
              network.state.data.summary=lastAssistantMessageText
            }
          }
          return result

        }
      }
    });
    const network=createNetwork({
      name:"coding-agent-network",
      agents:[codeAgent],
      maxIter:15,
      router:async({network})=>{
        const summary=network.state.data.summary;
        if(summary){
          return
        }
        return codeAgent

      }
    })

        const  result = await network.run(`Summarize the follwing text:${event.data.value}`);
        const  sandboxUrl=await step.run("get-sandbox-url",async()=>{
          const sandbox=getSandbox(sandboxId);
          const host=(await sandbox).getHost(3000);
          return `https://${host}`
        })

    // return { message: `Hello ${event.data.value}!` };
    return {url:sandboxUrl,
      title:"Fragment",
      files:result.state.data.files,
      summary:result.state.data.summary
    }
  },
);