# Web Crawler (TypeScript)

A TypeScript web crawler that:

- Crawls pages on a single domain
- Uses configurable concurrency with `p-limit`
- Stops after a configurable maximum number of unique pages
- Extracts structured page data:
  - URL
  - heading (`h1` with `h2` fallback)
  - first paragraph (`main p` preferred)
  - outgoing links
  - image URLs
- Writes a deterministic JSON report (`report.json`)

## Requirements

- Node.js 18+ (or any version with built-in `fetch`)
- npm

## Install

```bash
npm install
```

## Run

Usage:

```bash
npm run start <URL> <maxConcurrency> <maxPages>
```

Example:

```bash
npm run start https://learnwebscraping.dev/practice/ecommerce/ 3 10
```

Arguments:

- `URL` (required): Base URL to start crawling from
- `maxConcurrency` (optional, default `5`): Maximum concurrent fetches
- `maxPages` (optional, default `100`): Maximum unique pages to crawl

## Output

After a run, the crawler:

- Prints crawl progress to the terminal
- Prints a summary line for the first crawled page
- Generates `report.json` in the project root

`report.json` contains a sorted JSON array of page records.

## Test

```bash
npm run test
```

## Project Structure

- `src/crawl.ts` - crawling logic, extraction helpers, concurrency, and limits
- `src/report.ts` - JSON report writer
- `src/index.ts` - CLI entrypoint and argument handling

## Notes

- The crawler only follows links on the same domain as the base URL.
- It sets a custom user-agent (`BootCrawler/1.0`) for requests.
- Non-HTML responses and HTTP errors are handled safely and skipped.
