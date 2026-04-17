import { describe, expect, test } from "vitest";

import { normalizeURL } from "./crawl";

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
