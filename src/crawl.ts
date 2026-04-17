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
