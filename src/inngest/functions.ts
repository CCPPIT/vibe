import {  openai, createAgent,gemini,grok,anthropic ,createTool, createNetwork, Tool} from "@inngest/agent-kit";
import {Sandbox}from "@e2b/code-interpreter"
import { z, ZodObject } from "zod";

import { inngest } from "./client";
import { getSandbox, lastAssistantTextMessageContent } from "./utils";
import { PROMPT1 } from "@/prompt/prompt1";
import { PROMPT3 } from "@/prompt/prompt3";
import { PROMPT2 } from "@/prompt/prompt2";
import { PROMPT4 } from "@/prompt/prompt4";
import prisma from "@/lib/db";



interface AgentState{
  summary:string;
  files:{[path:string]:string}
}
export const codeAgentFunction = inngest.createFunction(
  { id: "code-agent" },
  { event: "code-agent/run" },
  async ({ event,step}) => {
    // await step.sleep("wait-a-moment", "1s");
    const sandboxId=await step.run("get-sandbox-id",async()=>{
      const sandbox=await Sandbox.create("vibe-nextjs-ccpp1");
      return sandbox.sandboxId
    })
    const codeAgent = createAgent<AgentState>({
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
          handler:async({command}:{command:string},{step})=>{
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
          handler:async({files},{step,network}:Tool.Options<AgentState>)=> {

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
    const network=createNetwork<AgentState>({
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

        const  result = await network.run(event.data.value);
        const isError=!result.state.data.summary||
        Object.keys(result.state.data.files||{}).length===0

        const  sandboxUrl=await step.run("get-sandbox-url",async()=>{
          const sandbox= await getSandbox(sandboxId);
          const host=sandbox.getHost(3000)
          return `https://${host}`
        })

    await step.run("save-result",async()=>{
      if(isError){
        return await prisma.message.create({
          data:{
            content:"Something went wrong. Please try again.",
            role:"ASSISTANT",
            type:"ERROR"
          }
        })
      }
      return await prisma.message.create({
        data:{
          content:result.state.data.summary,
          role:"ASSISTANT",
          type:"RESULT",
          fragment:{
            create:{
              sandboxUrl:sandboxUrl,
              files:result.state.data.files,
              title:"Fragment"
            }
          }
        }
      })
    })
    return {
      url:sandboxUrl,
      title:"Fragment",
      files:result.state.data.files,
      summary:result.state.data.summary
    }
  },
);