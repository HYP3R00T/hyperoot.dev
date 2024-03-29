import type { CollectionEntry } from "astro:content";
import { getCollection } from "astro:content";

/** Note: this function filters out draft posts based on the environment */
export async function getAllPosts() {
  return await getCollection("blog", ({ data }) => {
    return import.meta.env.PROD ? data.isDraft !== true : true;
  });
}

export function sortMDByDate(posts: Array<CollectionEntry<"blog">>) {
  return posts.sort((a, b) => {
    const aDate = new Date(a.data.updatedDate ?? a.data.pubDate).valueOf();
    const bDate = new Date(b.data.updatedDate ?? b.data.pubDate).valueOf();
    return bDate - aDate;
  });
}

/** Note: This function doesn't filter draft posts, pass it the result of getAllPosts above to do so. */
export function getAllTags(posts: Array<CollectionEntry<"blog">>) {
  return posts.flatMap((post) => [...post.data.tags]);
}

/** Note: This function doesn't filter draft posts, pass it the result of getAllPosts above to do so. */
export function getUniqueTags(posts: Array<CollectionEntry<"blog">>) {
  return [...new Set(getAllTags(posts))];
}

/** Note: This function doesn't filter draft posts, pass it the result of getAllPosts above to do so. */
export function getUniqueTagsWithCount(
  posts: Array<CollectionEntry<"blog">>
): Array<[string, number]> {
  return [
    ...getAllTags(posts).reduce(
      (acc, t) => acc.set(t, (acc.get(t) || 0) + 1),
      new Map<string, number>()
    ),
  ].sort((a, b) => b[1] - a[1]);
}
