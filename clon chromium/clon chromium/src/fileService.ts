import fs from "fs";
import path from "path";

export const DATA_DIR = path.join(__dirname, "..", "data");

export function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export async function saveJsonFile(name: string, data: any) {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, name);
  await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2));
  return filePath;
}
