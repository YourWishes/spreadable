import { App, appGetMain, WithApp } from "./app.ts";
import { appHostExecute } from "./host.ts";
import { appMainExecute, AppMainPayload } from "./main.ts";

/**
 *  Custom Method Type, Implements a caller that will simluate calling the 
 *  method directly, as well as some metadata.
 */
export type Method<
  R extends AllowedResponses,
  A extends Array<J>,
  J extends AllowedParamaters
> = (
  ((...args:A)=>Promise<R>) &
  {
    registeredName:string|null;
    registered:boolean;
    method:(...args:A)=>R;
  }
);

/**
 *  The possible allowed paramaters that can be passed down to a method.
 *    NOTE we don't allow recursion but we cannot prevent it here.
 */
export type AllowedParamaters = (
  string | boolean | number | ({ [key:string]:AllowedParamaters }) | null | undefined | void
);

export type AllowedResponses = AllowedParamaters;

/**
 *  Options that can be passed to modify how the method is created, currently no
 *  options exist, but may in future
 */
export type MethodCreateOptions = never;

/**
 *  Creates a new method that, in theory, can be distributed recursively.
 *  @param method Method that will be wrapped and can be executed by a host
 *  @param options Any options in the creation of the method
 */
export const methodCreate = <
  R extends AllowedResponses,
  A extends Array<J>,
  J extends AllowedParamaters
>(
  method:(...args:A)=>R, options?:MethodCreateOptions
) => {

  // Create Callable / Encaspulated method
  const hostMethod = async function(...args:A) {
    // For now I can't really contextualize this, so we will just do this for
    // now. This is the only place this method is actually used hopefully.
    const app = appGetMain();
    return await methodExecute({ method, hostMethod, args, app });
  } as Method<R,A,J>;

  // Setup Method Meta Info
  hostMethod.method = method;
  hostMethod.registered = false;
  hostMethod.registeredName = null;

  //Return as standard callable method
  return hostMethod;
}

//Shorthand
export const m = methodCreate;


export type MethodExecuteParams<
  R extends AllowedResponses,
  A extends Array<J>,
  J extends AllowedParamaters
> = {
  method:(...args:A)=>R;
  hostMethod:Method<R,A,J>;
  app:App;
  args:A;
}

/**
 *  Executing wrapper, responsible for handling how the method will be evenly
 *  distributed.
 */
export const methodExecute = async <
  R extends AllowedResponses,
  A extends Array<J>,
  J extends AllowedParamaters
>(
  params:MethodExecuteParams<R,A,J>
) => {
  const { app, hostMethod } = params;

  // I have been requested to do something, should I be processing it or sending
  // on its way?
  if(app.mode === 'main') {
    //I am main, forget it buddy.
    return await appMainExecute(params);
  } else if(app.mode === 'host') {
    //I am host, maybe buddy.
    return await appHostExecute(params);
  }
  
  //Fallack buddy.
  return hostMethod(...params.args);
};


export const methodGetByPayload = (params:WithApp & { payload:AppMainPayload }) => {
  const { app, payload } = params;
  const method = Object.values(app.methods).find(m => {
    return m.registeredName === payload.name
  });
  return method;
}