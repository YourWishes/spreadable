import { app } from "./app.ts";
import { calculate } from "./methods/calculate.ts";

await app.main(async () => {
  const runs = 3000;
  
  
  console.log('waiting starts now');
  const start = new Date();
  const queue:Promise<number>[] = [];
  for(let i = 0; i < runs; i++) {
    queue.push(calculate());
  }
  const allPi = await Promise.all(queue);
  const end = new Date();
  console.log('The wait took', end.getTime() - start.getTime(), 'ms');


  console.log('Doing the same again locally');
  const x = [];
  const start2 = new Date();
  for(let i = 0; i < runs; i++) {
    x.push(calculate.method());
  }
  const end2 = new Date();
  console.log('That wait took',  end2.getTime() - start2.getTime(), 'ms')
})