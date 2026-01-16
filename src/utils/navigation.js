const decodeSegment = (value = "") => {
  try {
    return decodeURIComponent(value);
  } catch (error) {
    return value;
  }
};

/**
 * Extracts website identifiers from a dashboard path such as
 * "/dashboard/websites/view/:id/:websiteName".
 *
 * @param {string} path
 * @returns {{websiteId: string, websiteSlug: string, websiteName: string}|null}
 */
export const extractWebsiteContextFromPath = (path = "") => {
  if (!path.includes("/websites")) {
    return null;
  }

  const cleanPath = path.split("?")[0];
  const segments = cleanPath.split("/").filter(Boolean);
  const websitesIndex = segments.indexOf("websites");

  if (websitesIndex === -1) {
    return null;
  }

  const viewIndex = segments.indexOf("view", websitesIndex);
  const websiteId = viewIndex > -1 ? segments[viewIndex + 1] : undefined;
  const websiteSlug = viewIndex > -1 ? segments[viewIndex + 2] || "" : "";

  if (!websiteId) {
    return null;
  }

  return {
    websiteId,
    websiteSlug,
    websiteName: decodeSegment(websiteSlug),
  };
};

/**
 * Extracts directory context from a dashboard path such as
 * "/dashboard/directories/view/:directoryName".
 *
 * @param {string} path
 * @returns {{directoryName: string}|null}
 */
export const extractDirectoryContextFromPath = (path = "") => {
  if (!path.includes("/directories")) {
    return null;
  }

  const cleanPath = path.split("?")[0];
  const segments = cleanPath.split("/").filter(Boolean);
  const directoriesIndex = segments.indexOf("directories");

  if (directoriesIndex === -1) {
    return null;
  }

  const viewIndex = segments.indexOf("view", directoriesIndex);
  const directoryName = viewIndex > -1 ? segments[viewIndex + 1] : undefined;

  if (!directoryName) {
    return null;
  }

  return {
    directoryName: decodeSegment(directoryName),
  };
};

/**
 * Extracts entity context from a dashboard path such as
 * "/dashboard/entities/view/:entityName".
 *
 * @param {string} path
 * @returns {{entityName: string}|null}
 */
export const extractEntityContextFromPath = (path = "") => {
  if (!path.includes("/entities")) {
    return null;
  }

  const cleanPath = path.split("?")[0];
  const segments = cleanPath.split("/").filter(Boolean);
  const entitiesIndex = segments.indexOf("entities");

  if (entitiesIndex === -1) {
    return null;
  }

  const viewIndex = segments.indexOf("view", entitiesIndex);
  const entityName = viewIndex > -1 ? segments[viewIndex + 1] : undefined;

  if (!entityName) {
    return null;
  }

  return {
    entityName: decodeSegment(entityName),
  };
};

/**
 * Extracts category context from a dashboard path such as
 * "/dashboard/categories/view/:categoryName".
 *
 * @param {string} path
 * @returns {{categoryName: string}|null}
 */
export const extractCategoryContextFromPath = (path = "") => {
  if (!path.includes("/categories")) {
    return null;
  }

  const cleanPath = path.split("?")[0];
  const segments = cleanPath.split("/").filter(Boolean);
  const categoriesIndex = segments.indexOf("categories");

  if (categoriesIndex === -1) {
    return null;
  }

  const viewIndex = segments.indexOf("view", categoriesIndex);
  const categoryName = viewIndex > -1 ? segments[viewIndex + 1] : undefined;

  if (!categoryName) {
    return null;
  }

  return {
    categoryName: decodeSegment(categoryName),
  };
};

/**
 * Extracts navigation context from any dashboard path.
 * Returns the type of context and the relevant data.
 *
 * @param {string} path
 * @returns {{type: 'website'|'directory'|'entity'|'category'|null, data: object}|null}
 */
export const extractNavigationContext = (path = "") => {
  // Try to extract website context
  const websiteContext = extractWebsiteContextFromPath(path);
  if (websiteContext) {
    return {
      type: 'website',
      data: websiteContext,
    };
  }

  // Try to extract directory context
  const directoryContext = extractDirectoryContextFromPath(path);
  if (directoryContext) {
    return {
      type: 'directory',
      data: directoryContext,
    };
  }

  // Try to extract entity context
  const entityContext = extractEntityContextFromPath(path);
  if (entityContext) {
    return {
      type: 'entity',
      data: entityContext,
    };
  }

  // Try to extract category context
  const categoryContext = extractCategoryContextFromPath(path);
  if (categoryContext) {
    return {
      type: 'category',
      data: categoryContext,
    };
  }

  return null;
};

/**
 * Sets the root navigation context (directory, entity, or category).
 * This is used to preserve the original context when navigating through multiple levels.
 * 
 * @param {object|null} context - The context object with {type, data} or null to clear
 */
export const setRootNavigationContext = (context) => {
  if (context === null) {
    localStorage.removeItem('rootNavigationContext');
  } else {
    localStorage.setItem('rootNavigationContext', JSON.stringify(context));
  }
};

/**
 * Gets the root navigation context if it exists.
 * Returns null if no root context is stored.
 * 
 * @returns {object|null} The root context or null
 */
export const getRootNavigationContext = () => {
  try {
    const stored = localStorage.getItem('rootNavigationContext');
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    return null;
  }
};

/**
 * Sets the website navigation context.
 * This is used to preserve the website context when navigating to pages/reports.
 * 
 * @param {object|null} context - The website context object with {websiteId, websiteSlug, websiteName} or null to clear
 */
export const setWebsiteNavigationContext = (context) => {
  if (context === null) {
    localStorage.removeItem('websiteNavigationContext');
  } else {
    localStorage.setItem('websiteNavigationContext', JSON.stringify(context));
  }
};

/**
 * Gets the website navigation context if it exists.
 * Returns null if no website context is stored.
 * 
 * @returns {object|null} The website context or null
 */
export const getWebsiteNavigationContext = () => {
  try {
    const stored = localStorage.getItem('websiteNavigationContext');
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    return null;
  }
};

/**
 * Gets the effective navigation context by checking:
 * 1. Root context (directory/entity/category) if exists
 * 2. Website context if exists (for page/report navigation from website)
 * 3. Current path context (for direct navigation)
 * 
 * @param {string} currentPath - The current URL path
 * @returns {object|null} The navigation context
 */
export const getEffectiveNavigationContext = (currentPath = "") => {
  // First check if we have a stored root context (directory, entity, category)
  const rootContext = getRootNavigationContext();
  
  // If we're viewing pages or websites, preserve the root context
  if (rootContext && (currentPath.includes('/pages') || currentPath.includes('/websites/view'))) {
    return rootContext;
  }
  
  // Check for website context (for navigation from website to pages/reports)
  const websiteContext = getWebsiteNavigationContext();
  if (websiteContext && (currentPath.includes('/pages'))) {
    return {
      type: 'website',
      data: websiteContext,
    };
  }
  
  // Otherwise, extract from current path
  return extractNavigationContext(currentPath);
};