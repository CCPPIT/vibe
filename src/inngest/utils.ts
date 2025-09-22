import Sandbox from "@e2b/code-interpreter";
import { AgentResult, TextMessage } from "@inngest/agent-kit";

export async function getSandbox(sandboxId:string) {
    const sandbox=await Sandbox.connect(sandboxId);
    return sandbox
    
}


export function lastAssistantTextMessageContent(result:AgentResult){
    const lastAssistantTextMessageIndex=result.output.findLastIndex(
        (mesage)=>mesage.role==="assistant"
    )
    const mesage=result.output[lastAssistantTextMessageIndex]as |TextMessage|undefined
    return mesage?.content
    ?typeof mesage.content==="string"
    ?mesage.content
    :mesage.content.map((c)=>c.text).join("")
    :undefined

}