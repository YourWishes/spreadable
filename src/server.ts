import { serve, ServerRequest } from "../deps.ts";


type Server = ReturnType<typeof serverCreate>;

// Shared Arg Types
type WithServer = { server:Server };

// Callback Types
type RequestCallback = (params:{ request:ServerRequest }) => void;
type StopCallback = (params:WithServer) => void;


// Methods
type ServerCreateParams = {
  port:number;
  onRequest:RequestCallback;
  onShutdown:StopCallback;
};

export const serverCreate = (params:ServerCreateParams) => {
  const server = serve({ ...params });

  (async () => {
    for await(const req of server) params.onRequest({ request: req });
  })().then(e => {
    params.onShutdown({ server });
  });
  
  return server;
}


export const serverStop = (params:WithServer) => params.server.close();