import type { GeneratedSection } from "./generate-docs";

const RELEVANT_SECTION_IDS = [
  "troubleshooting-performed",
  "resolution",
];

const KNOWN_COMMANDS = new Set([
  // Windows built-ins
  "assoc",
  "attrib",
  "auditpol",
  "bcdboot",
  "bcdedit",
  "bitsadmin",
  "break",
  "cacls",
  "call",
  "cd",
  "chcp",
  "chdir",
  "chkdsk",
  "chkntfs",
  "choice",
  "cipher",
  "clip",
  "cls",
  "cmd",
  "cmdkey",
  "color",
  "comp",
  "compact",
  "convert",
  "copy",
  "date",
  "defrag",
  "del",
  "deltree",
  "dir",
  "diskpart",
  "diskraid",
  "dism",
  "doskey",
  "driverquery",
  "echo",
  "edit",
  "endlocal",
  "erase",
  "esentutl",
  "eventcreate",
  "exit",
  "expand",
  "explorer",
  "fc",
  "find",
  "findstr",
  "finger",
  "fltmc",
  "for",
  "format",
  "fsutil",
  "ftp",
  "ftype",
  "getmac",
  "goto",
  "gpresult",
  "gpupdate",
  "graftabl",
  "help",
  "hostname",
  "icacls",
  "if",
  "ipconfig",
  "irp",
  "label",
  "lodctr",
  "logman",
  "makecab",
  "md",
  "mkdir",
  "mklink",
  "mode",
  "more",
  "mountvol",
  "move",
  "msdt",
  "msiexec",
  "mstsc",
  "nbtstat",
  "net",
  "netsh",
  "netstat",
  "nltest",
  "nslookup",
  "ntbackup",
  "ntsd",
  "openfiles",
  "path",
  "pathping",
  "pause",
  "ping",
  "pkgmgr",
  "pnputil",
  "popd",
  "powershell",
  "powershell_ise",
  "print",
  "prompt",
  "pushd",
  "qprocess",
  "quser",
  "qwinsta",
  "rasdial",
  "rd",
  "reagentc",
  "reg",
  "regedit",
  "regsvr32",
  "ren",
  "rename",
  "replace",
  "rmdir",
  "robocopy",
  "route",
  "runas",
  "rundll32",
  "sc",
  "schtasks",
  "sdbinst",
  "secedit",
  "set",
  "setlocal",
  "setx",
  "sfc",
  "shift",
  "shutdown",
  "sort",
  "start",
  "subst",
  "systeminfo",
  "takeown",
  "taskkill",
  "tasklist",
  "time",
  "timeout",
  "title",
  "tracert",
  "tree",
  "tskill",
  "type",
  "typeperf",
  "tzutil",
  "ver",
  "verify",
  "vol",
  "vssadmin",
  "w32tm",
  "waitfor",
  "wbadmin",
  "wecutil",
  "wevtutil",
  "where",
  "whoami",
  "winrm",
  "winrs",
  "wmic",
  "wsman",
  "xcopy",
  // Microsoft / Azure / AD / 365 support tools
  "az",
  "dsregcmd",
  "dsquery",
  "dcdiag",
  "repadmin",
  "adprep",
  "csvde",
  "ldifde",
  "dnscmd",
  "dfsrdiag",
  "dfsutil",
  "ntdsutil",
  "adrestore",
  "klist",
  "ktpass",
  // Windows package managers
  "winget",
  "choco",
]);

function normalizeLine(line: string): string | null {
  let trimmed = line.trim();
  if (!trimmed) return null;

  // Markdown headings
  if (/^#+/.test(trimmed)) return null;

  // Markdown code fence markers
  if (/^```/.test(trimmed)) return null;

  // Strip markdown bullets
  trimmed = trimmed.replace(/^\s*[-*•]\s*/, "");

  // Strip markdown numbering
  trimmed = trimmed.replace(/^\s*\d+[.)]\s*/, "");

  // Strip inline backticks
  trimmed = trimmed.replace(/^`+|`+$/g, "");

  // Strip common shell/prompt prefixes
  trimmed = trimmed.replace(/^(C:\\\\>?|\$>|PS>|\[\w+@[\w-]+\s+~\]\#?)\s*/i, "");

  if (!trimmed) return null;

  return trimmed;
}

function isProseExplanation(line: string): boolean {
  // Starts with common explanation words
  if (
    /^(this|that|these|those|the|a|an|to|follow|below|above|then|next|after|before|if|when|where|why|how|what|which|who|whose|run|use|using|type|enter|execute|perform|make|take|give|get|put|set|check|verify|ensure|confirm|test|update|install|remove|delete|create|enable|disable|reset|restore|scan|flush|purge|repair|fix|resolve)\s/i.test(
      line,
    )
  ) {
    return true;
  }

  // Contains common verb/auxiliary markers that indicate prose
  if (
    /\s(was|is|are|were|been|will|would|should|could|can|may|might|must|shall|did|does|do|has|had|have)\s/i.test(
      line,
    )
  ) {
    return true;
  }

  // Ends with sentence punctuation
  if (/[.!?]$/.test(line)) return true;

  // Contains explanatory intent phrases
  if (
    /(following command|as administrator|administrator|to repair|to fix|to resolve|to check|to verify|to test|to confirm|to update|to install|to remove|to delete|to create|to enable|to disable|to reset|to restore|to scan|to flush|to purge|will repair|will fix|will resolve|will check|will verify)/i.test(
      line,
    )
  ) {
    return true;
  }

  return false;
}

function isExecutableCommand(line: string): boolean {
  // Batch label
  if (/^:[a-zA-Z0-9_-]+$/.test(line)) return true;

  // REM / :: batch comments
  if (/^rem\s/i.test(line) || /^::/.test(line)) return true;

  // Get first token, stripping leading @ (silent operator) and quotes
  const match = line.match(/^(@*)(?:"([^"]+)"|'([^']+)'|(\S+))/);
  const firstToken = (match?.[2] ?? match?.[3] ?? match?.[4] ?? "").toLowerCase();

  if (KNOWN_COMMANDS.has(firstToken)) return true;

  // Absolute path executable
  if (/^[a-zA-Z]:\\.+\\[^\\]+\.(exe|cmd|bat|msi)(\s|$)/i.test(line)) return true;

  // Relative path executable
  if (/^\.{0,2}[\\/][^\\/]+\.(exe|cmd|bat)(\s|$)/i.test(line)) return true;

  return false;
}

function extractCodeBlocks(content: string): string[] {
  const blocks: string[] = [];
  const fenceRegex = /```[\w]*\n([\s\S]*?)```/g;
  let match;
  while ((match = fenceRegex.exec(content)) !== null) {
    if (match[1]) blocks.push(match[1]);
  }
  return blocks;
}

function extractInlineCode(content: string): string[] {
  const snippets: string[] = [];
  const inlineRegex = /`([^`]+)`/g;
  let match;
  while ((match = inlineRegex.exec(content)) !== null) {
    if (match[1]) snippets.push(match[1]);
  }
  return snippets;
}

function extractCommandLines(content: string): string[] {
  const commands: string[] = [];

  const collect = (raw: string) => {
    for (const line of raw.split("\n")) {
      const normalized = normalizeLine(line);
      if (!normalized) continue;
      if (isProseExplanation(normalized)) continue;
      if (!isExecutableCommand(normalized)) continue;
      commands.push(normalized);
    }
  };

  // 1. Fenced code blocks
  for (const block of extractCodeBlocks(content)) collect(block);

  // 2. Inline code, from text with fenced blocks removed (fence markers would
  //    otherwise pair up and swallow whole blocks as a single inline snippet).
  const withoutFences = content.replace(/```[\s\S]*?```/g, "");
  for (const snippet of extractInlineCode(withoutFences)) collect(snippet);

  // 3. Remaining plain text
  collect(withoutFences.replace(/`[^`]+`/g, ""));

  return commands;
}

export function extractBatCommands(sections: GeneratedSection[]): string[] {
  const commands: string[] = [];
  const seen = new Set<string>();
  for (const section of sections) {
    if (!RELEVANT_SECTION_IDS.includes(section.id)) continue;
    for (const command of extractCommandLines(section.content)) {
      const key = command.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      commands.push(command);
    }
  }
  return commands;
}


export function buildBatFile(sections: GeneratedSection[]): string {
  const commands = extractBatCommands(sections);
  if (commands.length === 0) return "";

  const lines = [
    "@echo off",
    "REM Generated by ITDoc AI",
    "REM Windows resolution batch file",
    "",
    ...commands,
    "",
  ];

  return lines.join("\r\n");
}

export function downloadBatFile(
  content: string,
  filename = "ITDoc-AI-Resolution.bat",
): void {
  if (typeof window === "undefined" || !window.document) return;

  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
