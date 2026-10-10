export const normalizeInstagramUrl = (url: string): string => {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") {
      throw new Error("Must be HTTPS");
    }
    
    if (parsed.hostname !== "instagram.com" && parsed.hostname !== "www.instagram.com") {
      throw new Error("Invalid domain");
    }

    let pathname = parsed.pathname;
    if (pathname.endsWith("/")) {
      pathname = pathname.slice(0, -1);
    }

    const segments = pathname.split("/");
    if (segments.length !== 3 || segments[0] !== "") {
      throw new Error("Invalid path structure");
    }

    const type = segments[1];
    if (!["p", "reel", "reels", "tv"].includes(type)) {
      throw new Error("Invalid post type");
    }

    return `https://www.instagram.com/${type}/${segments[2]}`;
  } catch (error) {
    throw new Error("Invalid Instagram URL");
  }
};
