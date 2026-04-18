export interface CasdoorConfig {
  serverUrl: string;
  clientId: string;
  organizationName: string;
  appName: string;
  redirectPath: string;
}

export const casdoorConfig: CasdoorConfig = {
  serverUrl: "http://localhost:18000",
  clientId: "337836a39ecb98df69ac",
  organizationName: "astergaze",
  appName: "asterconsult",
  redirectPath: "/callback",
};
