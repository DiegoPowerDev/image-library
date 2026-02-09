declare module "*.css";
export {};

declare global {
  interface Window {
    __UNSUB_FIRESTORE__?: () => void;
  }
}
