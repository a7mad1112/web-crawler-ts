import { crawlSiteAsync } from "./crawl";

function parsePositiveInteger(value: string): number | null {
	const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 1) {
    return null;
  }

  return parsed;
}

async function main(): Promise<void> {
	const args = process.argv.slice(2);

	if (args.length < 1) {
		console.error("no website provided");
		process.exit(1);
	}

	if (args.length > 3) {
		console.error("too many arguments provided. usage: npm run start <URL> <maxConcurrency> <maxPages>");
		process.exit(1);
	}

	const baseURL = args[0];
	const maxConcurrency = args[1] ? parsePositiveInteger(args[1]) : 5;
	const maxPages = args[2] ? parsePositiveInteger(args[2]) : 100;

	if (maxConcurrency === null) {
		console.error("maxConcurrency must be a positive integer");
		process.exit(1);
	}

	if (maxPages === null) {
		console.error("maxPages must be a positive integer");
		process.exit(1);
	}

	console.log(`starting crawl of: ${baseURL}`);
	console.log(`using maxConcurrency=${maxConcurrency}, maxPages=${maxPages}`);
	const pages = await crawlSiteAsync(baseURL, maxConcurrency, maxPages);
	console.log("crawl complete");
	console.log(pages);
}

void main();
