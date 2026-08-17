import { useEffect } from "react";

const SITE_NAME = "Urdu Typing Tutorial";

/**
 * Sets `document.title` for the current page, restoring the previous
 * title on unmount. Every route uses this so the browser tab always
 * reflects where the user is, which also makes manual route
 * verification straightforward.
 */
export function useDocumentTitle(pageTitle: string): void {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${pageTitle} · ${SITE_NAME}`;
    return () => {
      document.title = previousTitle;
    };
  }, [pageTitle]);
}
