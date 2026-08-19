export function installPreviewHostBridge(_options: {
  navigate?: (path: string) => void;
  getRoutePaths?: () => string[];
} = {}): () => void {
  return () => {};
}

export function collectRoutePathsFromTree(_routeTree: unknown): string[] {
  return ["/", "/login"];
}
