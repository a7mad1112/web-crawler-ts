import { describe, expect, test } from "vitest";

import {
  getFirstParagraphFromHTML,
  getHeadingFromHTML,
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
