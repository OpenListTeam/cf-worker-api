const Cookie = {
  set(name: string, value: string, days = 365): void {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
  },

  get(name: string): string | null {
    const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
    return match ? decodeURIComponent(match[2]) : null;
  },

  delete(name: string): void {
    document.cookie = `${name}=; Max-Age=0; path=/`;
  },
};

export default Cookie;
