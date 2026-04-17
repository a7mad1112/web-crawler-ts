import fs from "node:fs";
import path from "node:path";

import type { ExtractedPageData } from "./crawl";

export function writeJSONReport(
  pageData: Record<string, ExtractedPageData>,
  filename = "report.json",
): void {
  const sorted = Object.values(pageData).sort((a, b) => a.url.localeCompare(b.url));
  const output = JSON.stringify(sorted, null, 2);
  const reportPath = path.resolve(process.cwd(), filename);

  fs.writeFileSync(reportPath, output);
}
