import { JSDOM } from "jsdom";
import pLimit from "p-limit";

export type ExtractedPageData = {
  url: string;
  heading: string;
  first_paragraph: string;
  outgoing_links: string[];
  image_urls: string[];
};

export function normalizeURL(url: string): string {
  const urlObj = new URL(url);

  const host = urlObj.hostname.toLowerCase();
  const pathname = urlObj.pathname.endsWith("/")
    ? urlObj.pathname.slice(0, -1)
    : urlObj.pathname;

  return `${host}${pathname}${urlObj.search}`;
}

export function getHeadingFromHTML(html: string): string {
  const dom = new JSDOM(html);
  const h1 = dom.window.document.querySelector("h1");
  const h2 = dom.window.document.querySelector("h2");

  return h1?.textContent?.trim() || h2?.textContent?.trim() || "";
}

export function getFirstParagraphFromHTML(html: string): string {
  const dom = new JSDOM(html);
  const main = dom.window.document.querySelector("main");
  const paragraphInMain = main?.querySelector("p");
  const paragraphInDocument = dom.window.document.querySelector("p");

  return paragraphInMain?.textContent?.trim() || paragraphInDocument?.textContent?.trim() || "";
}

export function getURLsFromHTML(html: string, baseURL: string): string[] {
  const dom = new JSDOM(html);
  const anchorEls = dom.window.document.querySelectorAll("a");
  const urls: string[] = [];

  for (const anchorEl of anchorEls) {
    const href = anchorEl.getAttribute("href");
    if (!href) {
      continue;
    }

    urls.push(new URL(href, baseURL).href);
  }

  return urls;
}

export function getImagesFromHTML(html: string, baseURL: string): string[] {
  const dom = new JSDOM(html);
  const imageEls = dom.window.document.querySelectorAll("img");
  const imageURLs: string[] = [];

  for (const imageEl of imageEls) {
    const src = imageEl.getAttribute("src");
    if (!src) {
      continue;
    }

    imageURLs.push(new URL(src, baseURL).href);
  }

  return imageURLs;
}

export function extractPageData(html: string, pageURL: string): ExtractedPageData {
  return {
    url: pageURL,
    heading: getHeadingFromHTML(html),
    first_paragraph: getFirstParagraphFromHTML(html),
    outgoing_links: getURLsFromHTML(html, pageURL),
    image_urls: getImagesFromHTML(html, pageURL),
  };
}

export class ConcurrentCrawler {
  private baseURL: string;
  private baseURLObj: URL;
  private pages: Record<string, number>;
  private limit: ReturnType<typeof pLimit>;
  private maxPages: number;
  private shouldStop: boolean;
  private allTasks: Set<Promise<void>>;

  constructor(baseURL: string, maxConcurrency: number = 5, maxPages: number = 100) {
    this.baseURL = baseURL;
    this.baseURLObj = new URL(baseURL);
    this.pages = {};
    this.limit = pLimit(maxConcurrency);
    this.maxPages = maxPages;
    this.shouldStop = false;
    this.allTasks = new Set<Promise<void>>();
  }

  private addPageVisit(normalizedURL: string): boolean {
    if (this.shouldStop) {
      return false;
    }

    if (this.pages[normalizedURL]) {
      this.pages[normalizedURL]++;
      return false;
    }

    if (Object.keys(this.pages).length >= this.maxPages) {
      this.shouldStop = true;
      console.log("Reached maximum number of pages to crawl.");
      return false;
    }

    this.pages[normalizedURL] = 1;
    return true;
  }

  private async getHTML(currentURL: string): Promise<string> {
    return await this.limit(async () => {
      try {
        const response = await fetch(currentURL, {
          headers: {
            "User-Agent": "BootCrawler/1.0",
          },
        });

        if (response.status >= 400) {
          console.error(`error fetching page: ${response.status} ${response.statusText}`);
          return "";
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("text/html")) {
          console.error(`non-html response received: ${contentType ?? "unknown content type"}`);
          return "";
        }

        return await response.text();
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`network error while fetching page: ${message}`);
        return "";
      }
    });
  }

  private async crawlPage(currentURL: string): Promise<void> {
    if (this.shouldStop) {
      return;
    }

    let currentURLObj: URL;

    try {
      currentURLObj = new URL(currentURL);
    } catch {
      console.error(`invalid URL encountered: ${currentURL}`);
      return;
    }

    if (currentURLObj.hostname !== this.baseURLObj.hostname) {
      return;
    }

    const normalizedCurrentURL = normalizeURL(currentURL);
    const isNewPage = this.addPageVisit(normalizedCurrentURL);
    if (!isNewPage) {
      return;
    }

    console.log(`crawling: ${currentURL}`);

    const html = await this.getHTML(currentURL);
    if (!html) {
      return;
    }

    let nextURLs: string[];
    try {
      nextURLs = getURLsFromHTML(html, this.baseURL);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`error extracting links from ${currentURL}: ${message}`);
      return;
    }

    const crawlPromises: Promise<void>[] = [];
    for (const nextURL of nextURLs) {
      if (this.shouldStop) {
        break;
      }

      const crawlTask = this.crawlPage(nextURL);
      this.allTasks.add(crawlTask);
      void crawlTask.finally(() => {
        this.allTasks.delete(crawlTask);
      });
      crawlPromises.push(crawlTask);
    }

    await Promise.all(crawlPromises);
  }

  async crawl(): Promise<Record<string, number>> {
    const rootTask = this.crawlPage(this.baseURL);
    this.allTasks.add(rootTask);
    void rootTask.finally(() => {
      this.allTasks.delete(rootTask);
    });

    await rootTask;

    if (this.allTasks.size > 0) {
      await Promise.all(Array.from(this.allTasks));
    }

    return this.pages;
  }
}

export async function crawlSiteAsync(
  baseURL: string,
  maxConcurrency: number = 5,
  maxPages: number = 100,
): Promise<Record<string, number>> {
  const crawler = new ConcurrentCrawler(baseURL, maxConcurrency, maxPages);
  return await crawler.crawl();
}
