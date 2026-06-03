export const logger = {
  info: (msg: string, meta?: object) => console.log(JSON.stringify({ level: "info", msg, ...meta })),
  error: (msg: string, meta?: object) => console.error(JSON.stringify({ level: "error", msg, ...meta })),
  warn: (msg: string, meta?: object) => console.warn(JSON.stringify({ level: "warn", msg, ...meta })),
};
