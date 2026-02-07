const tokens = new Map();

export function saveToken(projectId, payload) {
  tokens.set(projectId, payload);
}

export function getToken(projectId) {
  return tokens.get(projectId);
}
