/**
 * Terminal Hacker Code Payloads & Difficulty Tiers
 * Real-world programming syntax, brackets, arrows, async/await, and cryptographic functions.
 */

import { KeyboardLayoutType } from '@/types/keyboard';

export type HackerTier = 'script_kiddie' | 'cyber_specialist' | 'kernel_hacker' | 'ghost_operator';

export interface HackerTierConfig {
  id: HackerTier;
  name: string;
  targetName: string;
  tagline: string;
  baseTraceRatePerSec: number; // percentage per second trace increases
  typoPenaltyTrace: number; // percentage trace jumps on typo
  charRewardTrace: number; // percentage trace drops on each correct character
  comboRewardTrace: number; // bonus trace drop every 10 combo
  iceDurationSeconds: number; // duration of ICE_PICK freeze
  scripts: string[][]; // array of code blocks (each line is a string)
  hebrewScripts: string[][];
}

export const HACKER_TIERS: Record<HackerTier, HackerTierConfig> = {
  script_kiddie: {
    id: 'script_kiddie',
    name: 'Script Kiddie',
    targetName: 'LOCAL_CORP_PROXY',
    tagline: 'Basic variables, loops, and simple function calls. Relaxed security trace.',
    baseTraceRatePerSec: 1.8,
    typoPenaltyTrace: 1.8,
    charRewardTrace: 0.38,
    comboRewardTrace: 2.5,
    iceDurationSeconds: 4.0,
    scripts: [
      [
        'const proxy = new ProxyTunnel("127.0.0.1:8080");',
        'let authenticated = proxy.connect("guest", "root");',
        'for (let i = 0; i < 4; i++) pingServer(i);',
        'return { status: "infiltrated", exitCode: 0 };',
      ],
      [
        'const token = generateSessionKey(32);',
        'const headers = { Authorization: `Bearer ${token}` };',
        'const user = { role: "admin", clearance: 3 };',
        'export default user;',
      ],
    ],
    hebrewScripts: [
      [
        'const משתמש = "מנהל-מערכת";',
        'let גישה = אימותסיסמה(משתמש, "רוט");',
        'עבור (let i = 0; i < 4; i++) בדיקתחיבור();',
        'חזרה { סטטוס: "הצלחה", קוד: 200 };',
      ],
    ],
  },
  cyber_specialist: {
    id: 'cyber_specialist',
    name: 'Cyber Specialist',
    targetName: 'BANK_CLUSTER_GATEWAY',
    tagline: 'Async operations, JSON payloads, brackets, and active trace defenses.',
    baseTraceRatePerSec: 2.6,
    typoPenaltyTrace: 2.4,
    charRewardTrace: 0.32,
    comboRewardTrace: 3.0,
    iceDurationSeconds: 3.2,
    scripts: [
      [
        'async function bypassFirewall(port: number): Promise<boolean> {',
        '  const res = await fetch(`/api/node/${port}`, { method: "POST" });',
        '  const { sessionToken, expires } = await res.json();',
        '  return verifySignature(sessionToken) === 0xCAFE;',
        '}',
      ],
      [
        'const sockets = new Map<string, WebSocket>();',
        'sockets.set("gateway", new WebSocket("wss://node.bank:443"));',
        'sockets.get("gateway")?.send(JSON.stringify({ breach: true }));',
        'return Array.from(sockets.keys()).length > 0;',
      ],
    ],
    hebrewScripts: [
      [
        'async function פריצתחומתאש(): Promise<boolean> {',
        '  const תגובה = await fetch("/api/שרת", { method: "POST" });',
        '  const { מפתח, פקיעה } = await תגובה.json();',
        '  return בדיקתחתימה(מפתח) === true;',
        '}',
      ],
    ],
  },
  kernel_hacker: {
    id: 'kernel_hacker',
    name: 'Kernel Hacker',
    targetName: 'MILITARY_ORBITAL_CORE',
    tagline: 'Classes, cryptographic buffers, hex transforms, and aggressive tracing.',
    baseTraceRatePerSec: 3.6,
    typoPenaltyTrace: 3.2,
    charRewardTrace: 0.28,
    comboRewardTrace: 3.5,
    iceDurationSeconds: 2.5,
    scripts: [
      [
        'class MemoryInjector extends TransformStream {',
        '  patchBuffer(dest: Uint8Array, offset: 0x7FFE): void {',
        '    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);',
        '    try { this.executeMemoryPatch(cipher.final()); }',
        '    catch (err) { logger.override(0xDEADBEEF); }',
        '  }',
        '}',
      ],
      [
        'const buffer = Buffer.alloc(1024, 0x90);',
        'buffer.writeUInt32BE(0x1337BEEF, 0x00);',
        'const sha256 = crypto.createHash("sha256").update(buffer).digest("hex");',
        'return { checksum: sha256, verified: true };',
      ],
    ],
    hebrewScripts: [
      [
        'class מזריקזיכרון extends הזרמתמידע {',
        '  תיקוןבאפר(מיקום: 0x7FFE): void {',
        '    const צופן = הצפנה("aes-256", מפתח);',
        '    try { ביצועטלאיזיכרון(צופן); }',
        '    catch (שגיאה) { דיווחקריסה(); }',
        '  }',
        '}',
      ],
    ],
  },
  ghost_operator: {
    id: 'ghost_operator',
    name: 'Ghost Operator',
    targetName: 'QUANTUM_AI_MAINFRAME',
    tagline: 'Maximum trace acceleration. Assembly opcodes, pointers, and regex.',
    baseTraceRatePerSec: 4.8,
    typoPenaltyTrace: 4.0,
    charRewardTrace: 0.24,
    comboRewardTrace: 4.0,
    iceDurationSeconds: 2.0,
    scripts: [
      [
        '0x7FFF0010: mov rax, [rbp - 0x18]; xor rdi, rdi;',
        'const regex = /^[A-Fa-f0-9]{32}:[a-z_]{8}$/i;',
        'while (!quantumNode.isDecrypted()) yield* intercept();',
        'syscall(SYS_OVERRIDE_ROOT, 0x0, 0xFFFFFFFF);',
      ],
      [
        'const stream = new ReadableStream({ start(ctrl) { ctrl.enqueue(0x00); } });',
        'const result = await stream.pipeThrough(new DecompressionStream("gzip"));',
        'Object.freeze(Object.assign(globalThis, { ROOT_PRIVILEGES: true }));',
      ],
    ],
    hebrewScripts: [
      [
        'const בדיקה = /^[A-Fa-f0-9]{32}:[א-ת_]{8}$/i;',
        'כלעוד (!ליבהקוונטית.פוענח()) בצעיירוט();',
        'פקודתמערכת(גישתרוט, 0x0, 0xFFFFFFFF);',
      ],
    ],
  },
};

/**
 * Returns a code script (array of lines) for the selected tier and layout.
 */
export function getHackerScript(tier: HackerTier, layout: KeyboardLayoutType = 'qwerty'): string[] {
  const config = HACKER_TIERS[tier];
  const isHebrew = layout === 'hebrew';
  const pool = isHebrew ? config.hebrewScripts : config.scripts;
  return pool[Math.floor(Math.random() * pool.length)] ?? config.scripts[0];
}

