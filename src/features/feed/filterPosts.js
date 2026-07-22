import { filterGuryePosts } from '../region/gurye';

export function filterPosts(posts, category) {
  const guryePosts = filterGuryePosts(posts);
  if (!category || category.id === 'all') return guryePosts;

  return guryePosts.filter((post) =>
    category.matchTags.some((tag) => post.tags.includes(tag)),
  );
}
