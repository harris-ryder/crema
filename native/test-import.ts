// Test file to verify @server alias works
import type { AppType } from "@server/type.d";

// This should resolve to ../server/src/type.d.ts
const testImport: AppType | undefined = undefined;

console.log("Import test successful if no TypeScript errors");