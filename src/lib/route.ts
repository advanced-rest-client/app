export function buildRoute(...route: string[]): string {
  const hash = route.map(encodeURIComponent).join('/');
  const url = new URL(window.location.href);
  url.hash = `/${hash}`;
  return url.toString();
}

/**
 * Navigates to another page.
 * 
 * @param htmlFile The relative location of the target HTML file.
 * @param route Optional route params to add to the has part of the url.
 */
export function navigatePage(htmlFile: string, ...route: string[]): void {
  const hash = route.map(encodeURIComponent).join('/');
  const url = new URL(htmlFile, window.location.href);
  url.hash = hash;
  window.location.href = url.toString();
}

/**
 * Navigates to a route.
 * 
 * @param route Optional route params to add to the has part of the url.
 */
export function navigate(...route: string[]): void {
  window.location.href = buildRoute(...route);
}
