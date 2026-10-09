import os from "os";
import path from "path";
function getConfigFilePath() {
    return path.join(os.homedir(), ".gatorconfig.json");
}
