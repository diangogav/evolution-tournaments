import { expect } from "vitest";

export function expectStatus(res: any, code: number) {
    if (res.status !== code) {
        console.error("Unexpected response:", res.body);
    }
    expect(res.status).toBe(code);
}
