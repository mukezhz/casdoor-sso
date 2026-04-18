import SDK from "casdoor-js-sdk";
import { casdoorConfig } from "../config/casdoor";

let sdkInstance: SDK | null = null;

export function getSdk(): SDK {
  if (!sdkInstance) {
    sdkInstance = new SDK(casdoorConfig);
  }

  return sdkInstance;
}

export function getStoredToken(): string | null {
  return localStorage.getItem("token");
}

export function storeToken(token: string): void {
  localStorage.setItem("token", token);
}

export function clearToken(): void {
  localStorage.removeItem("token");
}

export interface UserInfo {
  name?: string;
}

export async function fetchUserInfo(token: string): Promise<UserInfo> {
  const response = await fetch(`http://localhost:8080/api/getUserInfo?token=${encodeURIComponent(token)}`);
  return response.json() as Promise<UserInfo>;
}

export function hasAuthCodeInUrl(): boolean {
  const params = new URLSearchParams(globalThis.window.location.search);
  return params.has("code");
}

export function hasSilentSigninParam(): boolean {
  const params = new URLSearchParams(globalThis.window.location.search);
  return params.get("silentSignin") === "1";
}

export async function exchangeCodeForToken(): Promise<string | null> {
  if (!hasAuthCodeInUrl()) {
    return null;
  }

  const sdk = getSdk();
  const result = await sdk.signin("http://localhost:8080");
  const token = (result?.token as string | undefined) ?? null;

  if (token) {
    storeToken(token);
  }

  return token;
}
