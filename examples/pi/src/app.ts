import { appCreate } from "../../../src/app.ts";
import { appPeer } from "../../../src/peer.ts";
import { args } from "./args.ts";
import * as methods from './methods/all.ts';

export const app = appCreate({
  name: 'test',
  methods,
  peers: [
    `http://localhost:3000`,
    `http://localhost:3001`,
    `http://localhost:3002`,
    `http://localhost:3003`
  ].map(host => appPeer({ host }))
});