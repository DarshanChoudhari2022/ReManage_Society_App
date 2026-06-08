import { Socket } from "node:net";
import type { RateLimitStore } from "./rate-limit.service.ts";

export interface ValkeyCommandTransport {
  send(...command: readonly (string | number)[]): Promise<string | number>;
}

export class ValkeyRateLimitStore implements RateLimitStore {
  constructor(private readonly transport: ValkeyCommandTransport) {}

  async increment(key: string, windowMs: number): Promise<number> {
    const count = Number(await this.transport.send("INCR", key));

    if (count === 1) {
      await this.transport.send("PEXPIRE", key, windowMs);
    }

    return count;
  }
}

export class RespValkeyTransport implements ValkeyCommandTransport {
  constructor(
    private readonly options: {
      host: string;
      port: number;
      timeoutMs?: number;
    },
  ) {}

  async send(...command: readonly (string | number)[]): Promise<string | number> {
    const response = await this.roundTrip(encodeRespCommand(command));
    return decodeRespScalar(response);
  }

  private roundTrip(payload: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const socket = new Socket();
      const chunks: Buffer[] = [];
      const timeout = setTimeout(() => {
        socket.destroy();
        reject(new Error("Valkey command timed out"));
      }, this.options.timeoutMs ?? 2_000);

      socket.once("error", (error) => {
        clearTimeout(timeout);
        reject(error);
      });

      socket.on("data", (chunk) => {
        chunks.push(chunk);
        clearTimeout(timeout);
        socket.end();
        resolve(Buffer.concat(chunks).toString("utf8"));
      });

      socket.connect(this.options.port, this.options.host, () => {
        socket.write(payload);
      });
    });
  }
}

function encodeRespCommand(command: readonly (string | number)[]): string {
  return [
    `*${command.length}`,
    ...command.flatMap((part) => {
      const value = String(part);
      return [`$${Buffer.byteLength(value)}`, value];
    }),
    "",
  ].join("\r\n");
}

function decodeRespScalar(response: string): string | number {
  const type = response[0];
  const value = response.slice(1).split("\r\n")[0] ?? "";

  if (type === ":") {
    return Number(value);
  }

  if (type === "+" || type === "$") {
    return value;
  }

  if (type === "-") {
    throw new Error(value);
  }

  throw new Error(`Unsupported Valkey response: ${response}`);
}
