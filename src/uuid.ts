import { v4 } from "https://deno.land/std@0.83.0/uuid/mod.ts";

export type UUID = string;
export const uuidGen = () => v4.generate();