const URL_REGEX = /^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/;
export const MAX_TITLE_LENGTH = 80;
export const MAX_AUTHOR_LENGTH = 34;
export const MAX_FIELD_LENGTH = 24;
export const ERROR_DELAY_MS = 2300;

export function validateImageUrl(url: string): boolean {
  if (!url) return true;
  if (url.startsWith("data:image/") || url.startsWith("blob:")) return true;
  return URL_REGEX.test(url);
}
