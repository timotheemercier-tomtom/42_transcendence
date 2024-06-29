import { v4 as uuidv4 } from 'uuid';

export function getCookie(name: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
}

export const API = `http://${location.hostname}:3000`;

export const getJWTPayload = () => {
  const token = getCookie('accessToken') ?? '';

  function base64UrlToBase64(base64Url: string) {
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padLength = 4 - (base64.length % 4);
    if (padLength < 4) {
      for (let i = 0; i < padLength; i++) {
        base64 += '=';
      }
    }
    return base64;
  }

  function decodeJWT(token: string) {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { payload: {}, header: {} };
    }
    const header = JSON.parse(atob(base64UrlToBase64(parts[0])));
    const payload = JSON.parse(atob(base64UrlToBase64(parts[1])));
    return { header, payload };
  }

  const { payload } = decodeJWT(token);
  return payload;
};

export const getLogin = () => getJWTPayload()?.login;

export const randomUUID = () => {
  return uuidv4();
};
