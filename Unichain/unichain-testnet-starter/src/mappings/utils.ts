import {hexDataSlice, stripZeros} from '@ethersproject/bytes';

export function inputToFunctionSighash(input: string): string {
  return hexDataSlice(input, 0, 4);
}
  
export function isZero(input: string): boolean {
  return stripZeros(input).length === 0;
}