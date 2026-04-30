export const casdoorUrl = "https://accounts.localhost";
export const serverUrl = "https://api.localhost";

export interface CasdoorConfig {
  serverUrl: string;
  clientId: string;
  organizationName: string;
  appName: string;
  redirectPath: string;
}

export const casdoorConfig: CasdoorConfig = {
  serverUrl: casdoorUrl,
  clientId: "5b4008e5315cbc48fa51",
  organizationName: "astergaze",
  appName: "asterconsult",
  redirectPath: "/callback",
};
