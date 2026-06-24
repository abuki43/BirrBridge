import ky from 'ky';

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export const api = ky.create({
  prefix: process.env.EXPO_PUBLIC_API_URL,
  timeout: 15000,
  retry: 2,
  hooks: {
    beforeRequest: [
      ({ request }) => {
        if (authToken) {
          request.headers.set('Authorization', `Bearer ${authToken}`);
        }
      },
    ],
  },
});
