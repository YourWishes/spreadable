import { AppHostParams, appHost, AppHost } from "./host.ts";
import { AppMainParams, appMain, AppMain } from "./main.ts";
import { AllowedParamaters, AllowedResponses, Method } from "./method.ts";
import { AppPeer } from "./peer.ts";

export type App = ReturnType<typeof appCreate>;
export type WithApp = { app:App };

/**
 *  The App can only operate in 3 modes, but typically only two.
 *    main - For the root app that was executed
 *    host - For any hosts ready to take on executing
 *    sleep - For a client that is not accepting any work at all
 */
type AppMode = 'main' | 'host' | 'sleep';

// Context
let APP_MAIN:App|null = null;

// Methods
type AppCreateParams = {
  name:string;
  methods:{[key:string]:Method<AllowedResponses,AllowedParamaters[],AllowedParamaters>};
  peers:AppPeer[];
};

export const appCreate = (params:AppCreateParams) => {
  if(APP_MAIN) throw new Error(`App has already been created, cannot make two.`);

  // Create the app instance.
  const app = {
    ...params,
    mode: 'sleep' as AppMode,
    
    appMain: null as AppMain|null,
    appHost: null as AppHost|null,

    main:(params:AppMainParams) => appMain({ start: params, app }),
    host:(params:AppHostParams) => appHost({ ...params, app })
  };

  //Register our methods
  Object.entries(app.methods).forEach(([name,method]) => {
    method.registeredName = name;
    method.registered = true;
  });


  if(!APP_MAIN) APP_MAIN = app;
  return app;
}

export const appGetMain = () => {
  if(!APP_MAIN) throw new Error(`Tried to perform an action before the app has been setup!`);
  return APP_MAIN!;
};

