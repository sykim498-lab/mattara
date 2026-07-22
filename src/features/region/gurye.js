export const GURYE_REGION = '전라남도 구례군';

export function isGuryePost(post) {
  return post?.region === GURYE_REGION && post.address?.includes('구례군');
}

export function filterGuryePosts(posts) {
  return posts.filter(isGuryePost);
}

export function isGuryeCourse(course) {
  return course.steps.every((step) => step.address?.includes('구례군'));
}
