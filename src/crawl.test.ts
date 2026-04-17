import { describe, expect, test } from "vitest";

import {
  getFirstParagraphFromHTML,
  getHeadingFromHTML,
  getImagesFromHTML,
  getURLsFromHTML,
  normalizeURL,
} from "./crawl";

describe("normalizeURL", () => {
  test("strips protocol", () => {
    const input = "https://www.boot.dev/path";
    const actual = normalizeURL(input);
    const expected = "www.boot.dev/path";
    expect(actual).toBe(expected);
  });

  test("normalizes http and https to same result", () => {
    const httpsInput = "https://www.boot.dev/path";
    const httpInput = "http://www.boot.dev/path";

    expect(normalizeURL(httpsInput)).toBe(normalizeURL(httpInput));
  });

  test("removes trailing slash", () => {
    const input = "https://www.boot.dev/path/";
    const actual = normalizeURL(input);
    const expected = "www.boot.dev/path";
    expect(actual).toBe(expected);
  });

  test("lowercases hostname", () => {
    const input = "https://WWW.BOOT.DEV/path";
    const actual = normalizeURL(input);
    const expected = "www.boot.dev/path";
    expect(actual).toBe(expected);
  });

  test("preserves query string", () => {
    const input = "https://www.boot.dev/path?a=1&b=2";
    const actual = normalizeURL(input);
    const expected = "www.boot.dev/path?a=1&b=2";
    expect(actual).toBe(expected);
  });

  test("ignores hash fragment", () => {
    const input = "https://www.boot.dev/path#section";
    const actual = normalizeURL(input);
    const expected = "www.boot.dev/path";
    expect(actual).toBe(expected);
  });
});

describe("getHeadingFromHTML", () => {
  test("returns h1 text when present", () => {
    const inputBody = `<html><body><h1>Test Title</h1></body></html>`;
    const actual = getHeadingFromHTML(inputBody);
    const expected = "Test Title";
    expect(actual).toEqual(expected);
  });

  test("falls back to h2 when h1 is absent", () => {
    const inputBody = `<html><body><h2>Fallback Title</h2></body></html>`;
    const actual = getHeadingFromHTML(inputBody);
    const expected = "Fallback Title";
    expect(actual).toEqual(expected);
  });

  test("returns empty string when no h1 or h2 exists", () => {
    const inputBody = `<html><body><p>No headings here</p></body></html>`;
    const actual = getHeadingFromHTML(inputBody);
    const expected = "";
    expect(actual).toEqual(expected);
  });
});

describe("getFirstParagraphFromHTML", () => {
  test("prioritizes first paragraph inside main", () => {
    const inputBody = `
      <html><body>
        <p>Outside paragraph.</p>
        <main>
          <p>Main paragraph.</p>
          <p>Second main paragraph.</p>
        </main>
      </body></html>
    `;
    const actual = getFirstParagraphFromHTML(inputBody);
    const expected = "Main paragraph.";
    expect(actual).toEqual(expected);
  });

  test("falls back to first document paragraph when main is absent", () => {
    const inputBody = `<html><body><p>First paragraph.</p><p>Second paragraph.</p></body></html>`;
    const actual = getFirstParagraphFromHTML(inputBody);
    const expected = "First paragraph.";
    expect(actual).toEqual(expected);
  });

  test("returns empty string when no paragraph exists", () => {
    const inputBody = `<html><body><h1>Only heading</h1></body></html>`;
    const actual = getFirstParagraphFromHTML(inputBody);
    const expected = "";
    expect(actual).toEqual(expected);
  });
});

describe("getURLsFromHTML", () => {
  test("converts relative URLs to absolute", () => {
    const inputURL = "https://crawler-test.com";
    const inputBody = `<html><body><a href="/path/one"><span>Boot.dev</span></a></body></html>`;

    const actual = getURLsFromHTML(inputBody, inputURL);
    const expected = ["https://crawler-test.com/path/one"];

    expect(actual).toEqual(expected);
  });

  test("keeps absolute URLs as-is", () => {
    const inputURL = "https://crawler-test.com";
    const inputBody = `<html><body><a href="https://other-site.com/path">Link</a></body></html>`;

    const actual = getURLsFromHTML(inputBody, inputURL);
    const expected = ["https://other-site.com/path"];

    expect(actual).toEqual(expected);
  });

  test("returns all anchor href values and skips missing href", () => {
    const inputURL = "https://crawler-test.com";
    const inputBody = `
      <html><body>
        <a href="/one">One</a>
        <a>Missing href</a>
        <a href="/two">Two</a>
      </body></html>
    `;

    const actual = getURLsFromHTML(inputBody, inputURL);
    const expected = [
      "https://crawler-test.com/one",
      "https://crawler-test.com/two",
    ];

    expect(actual).toEqual(expected);
  });
});

describe("getImagesFromHTML", () => {
  test("converts relative src to absolute", () => {
    const inputURL = "https://crawler-test.com";
    const inputBody = `<html><body><img src="/logo.png" alt="Logo"></body></html>`;

    const actual = getImagesFromHTML(inputBody, inputURL);
    const expected = ["https://crawler-test.com/logo.png"];

    expect(actual).toEqual(expected);
  });

  test("keeps absolute image URLs as-is", () => {
    const inputURL = "https://crawler-test.com";
    const inputBody = `<html><body><img src="https://cdn.site.com/image.jpg"></body></html>`;

    const actual = getImagesFromHTML(inputBody, inputURL);
    const expected = ["https://cdn.site.com/image.jpg"];

    expect(actual).toEqual(expected);
  });

  test("returns all image src values and skips missing src", () => {
    const inputURL = "https://crawler-test.com";
    const inputBody = `
      <html><body>
        <img src="/a.png">
        <img alt="missing src">
        <img src="/b.png">
      </body></html>
    `;

    const actual = getImagesFromHTML(inputBody, inputURL);
    const expected = [
      "https://crawler-test.com/a.png",
      "https://crawler-test.com/b.png",
    ];

    expect(actual).toEqual(expected);
  });
});
