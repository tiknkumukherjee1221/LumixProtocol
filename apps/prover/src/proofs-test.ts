import "dotenv/config";
import { requireProofStack } from "@lumixprotocol/proof-utils";

await requireProofStack();
console.log("Proof stack inputs are present");
