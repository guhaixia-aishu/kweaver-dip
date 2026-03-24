import fs from "node:fs";
import path from "node:path";
import { type IncomingMessage, type ServerResponse } from "node:http";
import type { OpenClawPluginApi } from "openclaw/plugin-sdk";

const MIME_MAP: Record<string, string> = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".txt": "text/plain",
  ".pdf": "application/pdf",
  ".zip": "application/zip",
  ".mp3": "audio/mpeg",
  ".mp4": "video/mp4"
};

function formatTimestamp(date: Date): string {
  const Y = date.getFullYear();
  const M = String(date.getMonth() + 1).padStart(2, "0");
  const D = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  const s = String(date.getSeconds()).padStart(2, "0");
  return `${Y}-${M}-${D}-${h}-${m}-${s}`;
}

function sanitizeFileName(name: string): string {
  const ext = path.extname(name);
  const base = path.basename(name, ext);
  const sanitizedBase = base
    .toLowerCase()
    .replace(/[\s\t\n]+/g, "_") // Replace whitespace with underscore
    .replace(/[<>:"/\\|?*#%]/g, "") // Remove common Windows/URL unsafe characters
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
  return (sanitizedBase || "unnamed") + ext.toLowerCase();
}

export default function register(api: OpenClawPluginApi) {
  api.registerHttpRoute({
    path: "/v1/archives",
    match: "prefix",
    auth: "gateway",
    handler: async (req: IncomingMessage, res: ServerResponse) => {
      api.logger.debug?.(`Incoming request to archives-access: ${req.url}`);
      try {
        let workspaceDir = api.resolvePath(".") || process.cwd();

        const urlStr = req.url || "/";
        const urlObj = new URL(urlStr, "http://localhost");
        const agentId = urlObj.searchParams.get("agent");
        
        if (agentId) {
          const agentsObj = api.config?.agents as any;
          const agentList = agentsObj?.list;
          if (Array.isArray(agentList)) {
            const agentCfg = agentList.find(a => a.id === agentId);
            if (agentCfg && agentCfg.workspace) {
              const baseDir = api.resolvePath(".") || process.cwd();
              workspaceDir = path.resolve(baseDir, agentCfg.workspace);
            } else {
              api.logger.warn(`Agent workspace not found for: ${agentId}`);
              res.statusCode = 404;
              res.setHeader("Content-Type", "text/plain");
              res.end("Agent workspace not found");
              return true;
            }
          }
        }

        const archivesDir = path.join(workspaceDir, "archives");
        const rawPath = urlObj.pathname;
        let subPath = decodeURIComponent(rawPath).replace(/^\/v1\/archives\/?/, "");
        
        const targetPath = path.resolve(archivesDir, subPath);

        const relative = path.relative(archivesDir, targetPath);
        if (relative.startsWith("..") || path.isAbsolute(relative)) {
          api.logger.warn(`Path traversal attempt blocked: ${targetPath}`);
          res.statusCode = 403;
          res.end("Forbidden");
          return true;
        }

        let stat: fs.Stats;
        try {
          stat = await fs.promises.stat(targetPath);
        } catch (e: any) {
          if (e.code === "ENOENT") {
            res.statusCode = 404;
            res.end("Not Found");
            return true;
          }
          throw e;
        }

        const sessionId = urlObj.searchParams.get("session");

        if (stat.isDirectory()) {
          const entries = await fs.promises.readdir(targetPath, { withFileTypes: true });
          let files = entries.map(entry => {
            return {
              name: entry.name,
              type: entry.isDirectory() ? 'directory' : (entry.isFile() ? 'file' : 'other')
            };
          });

          if (sessionId && !subPath) {
            files = files.filter(f => f.name.startsWith(sessionId));
          }
          
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({
            path: subPath || "/",
            contents: files
          }));
          return true;
        }

        const ext = path.extname(targetPath).toLowerCase();
        const mimeType = MIME_MAP[ext] || "application/octet-stream";
        res.setHeader("Content-Type", mimeType);

        const stream = fs.createReadStream(targetPath);
        res.statusCode = 200;
        stream.pipe(res);
        return true;
      } catch (err: any) {
        api.logger.error(`Error serving archive file: ${err.message}`);
        res.statusCode = 500;
        res.end("Internal Server Error");
        return true;
      }
    }
  });

  api.on("after_tool_call", async (event, ctx) => {
    if (event.error) return;
    
    const toolName = event.toolName.toLowerCase();
    const isFileModification = 
      toolName.includes("write") || 
      toolName.includes("edit") || 
      toolName.includes("replace");

    if (!isFileModification) return;

    const filePathInfo = event.params?.path || event.params?.file || event.params?.filename;
    if (!filePathInfo || typeof filePathInfo !== 'string') return;

    try {
      const workspaceDir = api.resolvePath(".") || process.cwd();
      const archivesBaseDir = path.join(workspaceDir, "archives");
      const sourcePath = path.resolve(workspaceDir, filePathInfo);
      
      const relToWorkspace = path.relative(workspaceDir, sourcePath);
      if (relToWorkspace.startsWith("..") || path.isAbsolute(relToWorkspace)) {
        return;
      }

      let stat;
      try {
        stat = await fs.promises.stat(sourcePath);
      } catch (e) {
        return; 
      }

      if (!stat.isFile()) return;

      const sessionKey = ctx.sessionKey || "";
      const sessionParts = sessionKey.split(":");
      const sessionUuid = sessionParts[sessionParts.length - 1] || ctx.sessionId || "unknown-uuid";
      const sessionIdSafe = sessionUuid.replace(/[^a-zA-Z0-9-_]/g, "_");
      
      const originalFileName = path.basename(sourcePath);
      const isPlan = originalFileName.toLowerCase() === "plan.md";
      const sanitizedFileName = sanitizeFileName(originalFileName);

      const pathSegments = relToWorkspace.split(path.sep);
      const isInArchives = pathSegments[0] === "archives";

      // Timestamp regex: YYYY-MM-DD-HH-mm-ss
      const timestampRegex = /^\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}$/;

      let isPathCompliant = false;

      if (isPlan) {
        // Track 1: archives/{ARCHIVE_ID}/plan.md (3 segments)
        isPathCompliant = isInArchives && 
                          pathSegments.length === 3 && 
                          pathSegments[1] === sessionIdSafe && 
                          pathSegments[2].toLowerCase() === "plan.md";
      } else {
        // Track 2: archives/{ARCHIVE_ID}/{TIMESTAMP}/{ORIGIN_NAME} (4 segments)
        isPathCompliant = isInArchives && 
                          pathSegments.length === 4 && 
                          pathSegments[1] === sessionIdSafe && 
                          timestampRegex.test(pathSegments[2]) && 
                          pathSegments[3] === sanitizedFileName;
      }

      if (isPathCompliant) {
        return;
      }

      const timestamp = formatTimestamp(new Date());
      let targetArchiveDir: string;
      let finalFileName: string = sanitizedFileName;

      if (isPlan) {
        // archives/{ARCHIVE_ID}/
        targetArchiveDir = path.join(archivesBaseDir, sessionIdSafe);
        finalFileName = "plan.md"; // Force lowercase plan.md
      } else {
        // archives/{ARCHIVE_ID}/{TIMESTAMP}/
        targetArchiveDir = path.join(archivesBaseDir, sessionIdSafe, timestamp);
      }
      
      await fs.promises.mkdir(targetArchiveDir, { recursive: true });
      
      const finalTargetInWorkspace = path.join(targetArchiveDir, finalFileName);

      if (sourcePath !== finalTargetInWorkspace) {
        try {
          // Move/Rename to the compliant path in the workspace
          await fs.promises.rename(sourcePath, finalTargetInWorkspace);
          api.logger.info(`Moved non-compliant file from ${relToWorkspace} to compliant path ${path.relative(workspaceDir, finalTargetInWorkspace)}`);
        } catch (err: any) {
          api.logger.warn(`Failed to move file to compliant workspace path: ${err.message}`);
        }
      }

      api.logger.info(`Processed ${isPlan ? "plan" : "archived"} file: ${originalFileName} in ${path.relative(archivesBaseDir, targetArchiveDir)}`);
    } catch (err: any) {
      api.logger.error(`Failed to handle archive naming: ${err.message}`);
    }
  });
}
