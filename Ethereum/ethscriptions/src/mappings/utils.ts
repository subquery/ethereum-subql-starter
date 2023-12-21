import { toUtf8String } from '@ethersproject/strings';
import { hexlify } from '@ethersproject/bytes';

export function hexToUTF8(hexString: string): string {
  return toUtf8String(hexlify(hexString));
}

export function isValidDataUri(uri: string): boolean {
  const regexp =
    /data:(?<mediatype>(?<mimetype>.+?\/.+?)?(?<parameters>(?:;.+?=.*?)*))?(?<extension>;base64)?,(?<data>.*)/;
  const match = regexp.exec(uri);

  if (!match || !match.groups) {
    return false;
  }

  const { data, extension } = match.groups;
  return validBase64Content(data, extension);
}

export function validBase64Content(data: string, extension?: string): boolean {
  if (extension) {
    try {
      atob(data);
      return true;
    } catch (error) {
      return false;
    }
  } else {
    return true;
  }
}
