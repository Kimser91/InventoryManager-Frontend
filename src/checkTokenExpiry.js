export function isTokenExpired(token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000; // exp er i sekunder
      return Date.now() > expiry;
    } catch (e) {
      return true;
    }
  }
  