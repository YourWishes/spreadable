import { WithApp } from "./app.ts";
import { AppMainPayload } from "./main.ts";
import { AllowedParamaters, AllowedResponses, MethodExecuteParams, methodGetByPayload } from "./method.ts";
import { appPeerVerifyAll } from "./peer.ts";
import { serverCreate } from "./server.ts";
import { UUID, uuidGen } from './uuid.ts';

export type AppHost = AppHostParams;
export type AppHostPayload = {
  result:AllowedResponses;
  call:AppMainPayload;
  id:UUID;
};

export type AppHostParams = {
  port:number;
  start:()=>void;
};
export const appHost = async (params:WithApp & AppHostParams) => {
  const { app } = params;

  //Verify peers
  await appPeerVerifyAll({ app });

  const host = {
    ...params,
    server: serverCreate({
      ...params,

      onRequest: async p => {
        const { request } = p;
        const e = () => request.respond({ body: 'Bad request' });

        // Check Content Type
        const header = request.headers.get('Content-Type');
        if(!header || header.indexOf('application/json') === -1) return await e();

        try {

          //Buffer into a string
          const buffer = await Deno.readAll(request.body);
          const decoder = new TextDecoder();
          const body = decoder.decode(buffer);
          if(!body || !body.length) return await e();

          //Parse JSON
          const payload = JSON.parse(body) as AppMainPayload;
          if(!payload) return await e();
          
          //Execute
          const method = methodGetByPayload({ app, payload });
          if(!method) return await e();

          const response:AppHostPayload = {
            //@ts-ignore bruh
            call: payload,
            result: await method(...payload.args),
            id:uuidGen()
          };

          console.log(payload.name, response.id);

          //Response
          request.respond({
            headers: new Headers({
              'Content-Type': 'application/json'
            }),
            body: JSON.stringify(response)
          });
        } catch(ex) {
          console.error(ex);
          return await e();
        }
      },

      onShutdown: p => {

      }
    })
  };

  app.mode = 'host';
  app.appHost = host;
  return await params.start();
}


export const appHostExecute =  async <
  R extends AllowedResponses,
  A extends Array<J>,
  J extends AllowedParamaters
>(params:MethodExecuteParams<R,A,J>) => {
  // In future we can probably delegate particularly large functions to a worker
  return await new Promise(resolve => {
    resolve( params.method(...params.args) );
  });
};