import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export type Config = {
  dbUrl: string;
  currentUserName?: string;
};

function getConfigFilePath(): string {
  return path.join(os.homedir(), ".gatorconfig.json");
}

export function readConfig(): Config {
  const filePath = getConfigFilePath();
  const data = fs.readFileSync(filePath, "utf-8");
  const parsedConfig = JSON.parse(data);

  return {
    dbUrl: parsedConfig.db_url,
    currentUserName: parsedConfig.current_user_name,
  };
}

export function setUser(username: string): void {
  const filePath = getConfigFilePath();

  const data = fs.readFileSync(filePath, "utf-8");
  const parsedConfig = JSON.parse(data);

  parsedConfig.current_user_name = username;

  fs.writeFileSync(
    filePath,
    JSON.stringify(parsedConfig, null, 2)
  );
}