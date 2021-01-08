import { WithApp } from "./app.ts";
import { AppMainPayload } from "./main.ts";

export type AppPeer = ReturnType<typeof appPeer>;
export type WithPeer = { peer:AppPeer };

export type AppPeerParams = {
  host:string;
};

export const appPeer = (params:AppPeerParams) => {
  const peer = {
    ...params,
    available: false,
    lastQueue: 0,
    lastCall: new Date()
  };

  return peer;
}

export const appPeerSend = async <R>(params:(
  WithPeer & { payload:AppMainPayload }
)):Promise<R> => {
  const { peer, payload } = params;

  const response = await fetch(peer.host, {
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
    body: JSON.stringify(payload)
  });

  return (await response.json()) as R;
}

export const appPeerDecide = (params:WithApp) => {
  const { app } = params;
  //TODO: Write Some Logic around this
  const availablePeers = app.peers.filter(p => p.available);

  //Pick random remaining
  const peer = availablePeers.sort((l,r) => {
    return l.lastCall.getTime() - r.lastCall.getTime();
  })[0];
  return peer;
}

export const appPeerVerify = async (params:WithApp & WithPeer) => {
  const { app, peer } = params;

  //During the verify process the peer becomes unavailable
  peer.available = false;
  await new Promise(resolve => setTimeout(resolve, 1000));

  //Now that the peer has been successfully verified we can mark it as available
  peer.available = true;
}

export const appPeerVerifyAll = async (params:WithApp) => {
  const { app } = params;
  await Promise.all(app.peers.map(peer => {
    return appPeerVerify({ app, peer });
  }))
}