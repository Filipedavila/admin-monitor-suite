// Authorization levels returned by POST /auth/login (data.authorizationLevel).
// manager: full access; editor: view, create and edit (no delete); viewer: read only.
export const AUTHORIZATION_LEVELS = {
  MANAGER: "manager",
  EDITOR: "editor",
  VIEWER: "viewer",
};

export const AUTHORIZATION_LEVEL_STORAGE_KEY = "@AMS:authorizationLevel";
export const AMS_ENV_STORAGE_KEY = "@AMS:amsEnv";

const PERMISSIONS_BY_LEVEL = {
  [AUTHORIZATION_LEVELS.MANAGER]: { canView: true, canCreate: true, canEdit: true, canDelete: true },
  [AUTHORIZATION_LEVELS.EDITOR]: { canView: true, canCreate: true, canEdit: true, canDelete: false },
  [AUTHORIZATION_LEVELS.VIEWER]: { canView: true, canCreate: false, canEdit: false, canDelete: false },
};

// Unknown or missing levels fall back to read-only access.
export const getPermissions = (authorizationLevel) =>
  PERMISSIONS_BY_LEVEL[String(authorizationLevel || "").toLowerCase()] ??
  PERMISSIONS_BY_LEVEL[AUTHORIZATION_LEVELS.VIEWER];

export const getStoredAuthorizationLevel = () => {
  try {
    return localStorage.getItem(AUTHORIZATION_LEVEL_STORAGE_KEY);
  } catch {
    return null;
  }
};

export const getStoredAmsEnv = () => {
  try {
    return localStorage.getItem(AMS_ENV_STORAGE_KEY);
  } catch {
    return null;
  }
};

// Removes the "edit" column from SortingTable headers when the user cannot edit.
export const filterEditColumn = (headers, canEdit) =>
  canEdit ? headers : headers.map((row) => row.filter((header) => header.property !== "edit"));
