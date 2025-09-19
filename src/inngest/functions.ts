import { inngest } from "./client"

export const holleWorld=inngest.createFunction({
    id:"holle-world",
    
},
{event:"test/hello.world"},
async({event,step})=>{
    await step.sleep("wait-a-moment", "10s");
    return {message:`holle ${event.data.email}`}

}
)