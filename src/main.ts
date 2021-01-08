import { WithApp } from "./app.ts";
import { AppHostPayload } from "./host.ts";
import { AllowedParamaters, AllowedResponses, MethodExecuteParams } from "./method.ts";
import { appPeerDecide, appPeerSend, appPeerVerify, appPeerVerifyAll } from "./peer.ts";

const APP_MAIN_OFFLOAD_ATTEMPT_MAX = 3;

export type AppMain = {
  nothing:null;
};

export type AppMainPayload = (
  { action:'call', name:string; args:AllowedParamaters[] } |
  { action:'ping' }
);

export type AppMainParams = ()=>Promise<void>;
export const appMain = async (params:{start:AppMainParams}&WithApp) => {
  const { app, start } = params;

  //Verify the peers...
  await appPeerVerifyAll({ app });

  //Create the app
  const main:AppMain = { 
    nothing:null
  };
  
  app.mode = 'main';
  app.appMain = main;
  
  //Start the app
  return await start();
}

export const appMainExecute = async <
  R extends AllowedResponses,
  A extends Array<J>,
  J extends AllowedParamaters
>(
  params:MethodExecuteParams<R,A,J>
) => {
  const { app, args, hostMethod } = params;

  if(!hostMethod.registered || !hostMethod.registeredName) {
    throw new Error(`Attempted to call an unregistered method!`);
  }

  const payload:AppMainPayload = {
    name: hostMethod.registeredName!,
    args
  };

  let attempts = 0;
  while(attempts < APP_MAIN_OFFLOAD_ATTEMPT_MAX) {
    //Select a peer
    attempts++;
    const peer = appPeerDecide({ app });
    if(!peer) break;

    try {
      const response = await appPeerSend<AppHostPayload>({ peer, payload });
      if(!response) throw new Error('Failed to parse');
      return response.result;
    } catch(e) {
      //Hmm something went wrong, maybe the peer?
      appPeerVerify({ app, peer });
      console.error(e);
    }
  }

  //Fallback in cases where attempt limit is reached (or no available peers)
  return hostMethod.method(...args);
};