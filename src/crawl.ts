import { JSDOM } from "jsdom";

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
