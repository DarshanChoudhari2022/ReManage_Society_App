"use client";

import { useEffect } from "react";
import { translateLegacyPageText } from "@/lib/page-translations";
import { translateStaticText, useI18n } from "@/lib/i18n";

const textOriginals = new WeakMap<Text, string>();
const attrOriginals = new WeakMap<Element, Map<string, string>>();
const TRANSLATABLE_ATTRS = ["placeholder", "title", "aria-label"];
const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "TEXTAREA", "INPUT", "CODE", "PRE"]);

function withOriginalWhitespace(original: string, translated: string) {
  const leading = original.match(/^\s*/)?.[0] || "";
  const trailing = original.match(/\s*$/)?.[0] || "";
  return `${leading}${translated}${trailing}`;
}

function translateValue(value: string, language: ReturnType<typeof useI18n>["language"]) {
  const trimmed = value.trim();
  if (!trimmed) return value;
  const staticTranslated = translateStaticText(trimmed, language);
  const translated = staticTranslated !== trimmed ? staticTranslated : translateLegacyPageText(trimmed, language);
  return translated === trimmed ? value : withOriginalWhitespace(value, translated);
}

function translateTextNode(node: Text, language: ReturnType<typeof useI18n>["language"]) {
  const parent = node.parentElement;
  if (!parent || SKIP_TAGS.has(parent.tagName) || parent.closest("[data-no-translate]")) return;

  const original = textOriginals.get(node) ?? node.textContent ?? "";
  if (!textOriginals.has(node)) textOriginals.set(node, original);
  const nextText = language === "en" ? original : translateValue(original, language);
  if (node.textContent !== nextText) node.textContent = nextText;
}

function translateElementAttributes(element: Element, language: ReturnType<typeof useI18n>["language"]) {
  if (element.closest("[data-no-translate]")) return;

  for (const attr of TRANSLATABLE_ATTRS) {
    const current = element.getAttribute(attr);
    if (!current) continue;

    let originals = attrOriginals.get(element);
    if (!originals) {
      originals = new Map();
      attrOriginals.set(element, originals);
    }
    if (!originals.has(attr)) originals.set(attr, current);

    const original = originals.get(attr) || current;
    const nextValue = language === "en" ? original : translateValue(original, language);
    if (element.getAttribute(attr) !== nextValue) element.setAttribute(attr, nextValue);
  }
}

function translateTree(root: ParentNode, language: ReturnType<typeof useI18n>["language"]) {
  if (root instanceof Element) translateElementAttributes(root, language);

  const textWalker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let textNode = textWalker.nextNode();
  while (textNode) {
    translateTextNode(textNode as Text, language);
    textNode = textWalker.nextNode();
  }

  if (root instanceof Element || root instanceof Document) {
    const elementRoot = root instanceof Document ? root.body : root;
    elementRoot?.querySelectorAll?.("*").forEach((element) => translateElementAttributes(element, language));
  }
}

export default function PageTextTranslator() {
  const { language } = useI18n();

  useEffect(() => {
    translateTree(document.body, language);

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "characterData") {
          translateTextNode(mutation.target as Text, language);
          continue;
        }
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            translateTextNode(node as Text, language);
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            translateTree(node as Element, language);
          }
        });
        if (mutation.type === "attributes" && mutation.target instanceof Element) {
          translateElementAttributes(mutation.target, language);
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: TRANSLATABLE_ATTRS,
    });

    return () => observer.disconnect();
  }, [language]);

  return null;
}
