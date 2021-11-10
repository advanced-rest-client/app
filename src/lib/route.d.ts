export interface Route {
  /**
   * The name of the route
   */
  name: string;
  /**
   * The pattern to evaluate
   */
  pattern: string;
}

export interface RouteResult {
  /**
   * The matched route
   */
  route: Route;
  /**
   * Captured parameters
   */
  params?: Record<string, string|string[]>;
}

/**
 * @param uri The path value of the current URL.
 * @param pattern The pattern to evaluate
 */
export function testRoute(uri: string, pattern: string): boolean;

/**
 * @param pattern The pattern to evaluate
 * @param uri The path value of the current URL.
 */
export function parseParams(pattern: string, uri: string): Record<string, string>;

/**
 * @param routes List of routes to evaluate
 * @param path Current path
 */
export function findRoute(routes: Route[], path: string): RouteResult|null;

/**
 * Navigates to another page.
 * 
 * @param htmlFile The relative location of the target HTML file.
 * @param route Optional route params to add to the has part of the url.
 */
export function navigatePage(htmlFile: string, ...route: string[]): void;

/**
 * Navigates to a route.
 * 
 * @param route Optional route params to add to the has part of the url.
 */
export function navigate(...route: string[]): void;
