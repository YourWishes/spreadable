import { app } from "./app.ts";
import { args } from "./args.ts";

await app.host({
  port: parseInt(args.port||'3000'),
  start: () => {
    console.log('Hosting for app.');
  }
})