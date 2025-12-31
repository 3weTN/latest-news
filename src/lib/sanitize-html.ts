import sanitize from "sanitize-html";

/**
 * Sanitizes HTML content to prevent XSS attacks
 * Allows safe HTML tags while removing dangerous content
 */
export function sanitizeHtml(dirty: string): string {
  return sanitize(dirty, {
    allowedTags: [
      "p",
      "br",
      "strong",
      "em",
      "u",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "blockquote",
      "ul",
      "ol",
      "li",
      "a",
      "img",
      "div",
      "span",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
    ],
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "title", "width", "height"],
      "*": ["class"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: {
      img: ["http", "https", "data"],
    },
    // Enforce target="_blank" and rel="noopener noreferrer" for external links
    transformTags: {
      a: (tagName, attribs) => {
        return {
          tagName,
          attribs: {
            ...attribs,
            target: "_blank",
            rel: "noopener noreferrer",
          },
        };
      },
    },
  });
}
