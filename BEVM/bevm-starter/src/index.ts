//Exports all handler functions
export * from "./mappings/mappingHandlers";

import { atob } from "abab";

if (!global.atob) {
  global.atob = atob as any;
}
