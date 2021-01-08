import { m } from "../../../../src/method.ts";

export const calculate = m(() => {
  let x = 0;
  for(let i = 0; i < 9999999; i++) {
    x = Math.PI;
  }
  return x;
});