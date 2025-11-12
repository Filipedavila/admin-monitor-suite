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
