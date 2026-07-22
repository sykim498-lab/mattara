export const GURYE_REGION = '전라남도 구례군';

export const BLOCKED_FRANCHISE_NAMES = [
  '스타벅스',
  '투썸플레이스',
  '이디야',
  '메가커피',
  '컴포즈커피',
  '빽다방',
  '파리바게뜨',
  '뚜레쥬르',
  '맥도날드',
  '롯데리아',
  '버거킹',
  '서브웨이',
  '배스킨라빈스',
  '교촌치킨',
  'BBQ',
  'BHC',
];

export function isFranchisePlace(place) {
  const normalizedName = place?.name?.replaceAll(' ', '').toLocaleUpperCase('ko-KR') ?? '';
  return place?.local === false || BLOCKED_FRANCHISE_NAMES.some((name) =>
    normalizedName.includes(name.replaceAll(' ', '').toLocaleUpperCase('ko-KR')),
  );
}

export function isLocalGuryePlace(place) {
  return place?.address?.includes('구례군') && !isFranchisePlace(place);
}

export function isGuryePost(post) {
  return post?.region === GURYE_REGION && isLocalGuryePlace(post);
}

export function filterGuryePosts(posts) {
  return posts.filter(isGuryePost);
}

export function isGuryeCourse(course) {
  return course?.steps?.length > 0 && course.steps.every(isLocalGuryePlace);
}
