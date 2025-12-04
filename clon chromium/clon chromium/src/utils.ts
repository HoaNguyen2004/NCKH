import md5 from "md5";

export function emailToHash(email: string): string {
  return md5(email.trim().toLowerCase());
}
