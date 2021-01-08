import { parse } from "https://deno.land/std@0.83.0/flags/mod.ts";

export const args = parse(Deno.args) as {
  peer?:string;
  port?:string;
};