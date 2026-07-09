import { Banner } from "./types";

function getCreatedAtMillis(createdAt: Banner["createdAt"]) {
  if (createdAt && typeof createdAt === "object" && "seconds" in createdAt) {
    return createdAt.seconds * 1000;
  }

  if (typeof createdAt === "string") {
    return new Date(createdAt).getTime();
  }

  return 0;
}

export function sortBannersByCreatedAt(banners: Banner[]) {
  return [...banners].sort(
    (left, right) => getCreatedAtMillis(right.createdAt) - getCreatedAtMillis(left.createdAt)
  );
}

export function formatBannerCreatedAt(createdAt: Banner["createdAt"]) {
  const millis = getCreatedAtMillis(createdAt);
  return millis ? new Date(millis).toLocaleDateString() : "";
}
