import { atob } from "abab";

if (!global.atob) {
  global.atob = atob as any;
}

//Exports all handler functions
export * from "./mappings/helper";
export * from "./mappings/spacestationv1";
export * from "./mappings/spacestationv2";
export * from "./mappings/starnft";
export * from "./mappings/starnftfactory";
