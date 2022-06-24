export interface IndexableRequest {
  /**
   * stored request ID
   */
  id: string;
  /**
   * store name or identifier
   */
  type: string;
  /**
   * the URL to index
   */
  url: string;
}

export interface IndexQueryOptions {
  /**
   * Request type: `saved` or `history`
   */
  type?: string;
  /**
   * If set it uses slower algorithm but performs full
   * search on the index. When `false` it only uses filer like query + '*'.
   */
  detailed?: boolean;
}

export interface IndexQueryResult {
  [key: string]: string;
}
