import { saveAs } from "file-saver";
import { api } from "../config/api";

const FILENAME_RE = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i;

const filenameFromHeaders = (headers, fallback) => {
  const match = FILENAME_RE.exec(headers?.["content-disposition"] || "");
  if (!match) return fallback;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
};

/**
 * GET /v2/analytics/exports?resource=&format=&context=&entityId= (Analytics > Export analytics report).
 * Resposta em stream (binário). `entityId` só se aplica aos recursos de uma entidade
 * (website, tag, institution, directory); o endpoint exige o papel ADMIN.
 */
export const exportAnalytics = ({ resource, format = "csv", context, entityId }) => {
  const params = { resource, format, context };
  if (entityId !== undefined && entityId !== null && entityId !== "") {
    params.entityId = Number(entityId);
  }
  return api.get("/analytics/exports", { params, responseType: "blob" });
};

/** Pede a exportação e guarda o ficheiro com o nome sugerido pelo servidor. */
export const downloadAnalyticsExport = async (options) => {
  const { format = "csv", resource, entityId } = options;
  const response = await exportAnalytics(options);
  const fallback = `analytics-${resource}${entityId ? `-${entityId}` : ""}.${format}`;
  saveAs(response.data, filenameFromHeaders(response.headers, fallback));
};
