import { atob } from "abab";

if (!global.atob) {
  global.atob = atob as any;
}

//Exports all handler functions
export * from "./mappings/setDelegate";
export * from "./mappings/clearDelegate";
export * from "./mappings/factory";
