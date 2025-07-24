// global.d.ts
import { AbortSignal } from 'node-fetch';

declare global {
  interface AbortSignal {
    timeout(milliseconds: number): AbortSignal;
  }
}
