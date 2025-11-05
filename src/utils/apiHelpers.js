export const isRequestSuccessful = (response) => {
  if (!response) {
    return false;
  }

  const { data, status } = response ?? {};

  if (typeof data?.success === "boolean") {
    return data.success;
  }

  const result = data?.result;
  if (result && typeof result === "object") {
    if (typeof result.success === "boolean") {
      return result.success;
    }

    const numericKeys = ["deleted", "deletedCount", "removed", "affectedRows"];
    for (const key of numericKeys) {
      if (typeof result[key] === "number") {
        return result[key] > 0;
      }
    }

    const arrayKeys = ["deletedIds", "ids", "pages"];
    for (const key of arrayKeys) {
      if (Array.isArray(result[key])) {
        return result[key].length > 0;
      }
    }
  }

  const fallbackNumericKeys = ["deleted", "deletedCount", "removed", "affectedRows"];
  for (const key of fallbackNumericKeys) {
    if (typeof data?.[key] === "number") {
      return data[key] > 0;
    }
  }

  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    return false;
  }

  if (typeof data?.error === "boolean") {
    return !data.error;
  }

  const message = data?.message ?? data?.Message;
  if (typeof message === "string") {
    const normalizedMessage = message.toLowerCase();
    if (normalizedMessage.includes("erro")) {
      return false;
    }
    if (normalizedMessage.includes("sucesso") || normalizedMessage.includes("success")) {
      return true;
    }
  }

  return status >= 200 && status < 300;
};
