import { isGuryeCourse } from '../features/region/gurye';

const stockPhoto = (id) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1000&q=85`;

const createPlace = (name, label, image, lat, lng, address, description) => ({
  name,
  label,
  image,
  lat,
  lng,
  address,
  description,
});

const guryePlace = {
  bamboo: () => createPlace(
    '섬진강대숲길',
    '강바람 릴랙스',
    stockPhoto('photo-1523712999610-f77fbcfc3843'),
    35.1962,
    127.4644,
    '전라남도 구례군 구례읍 원방리 1',
    '대나무 향과 섬진강 바람을 따라 천천히 걸으며 호흡을 고르는 시간이에요.',
  ),
  ssangsanje: () => createPlace(
    '쌍산재',
    '한옥 차담',
    stockPhoto('photo-1528360983277-13d401cdc186'),
    35.2387,
    127.4814,
    '전라남도 구례군 마산면 장수길 3-2',
    '대나무 숲길을 지나 300년 고택의 정취와 조용한 차담을 즐겨요.',
  ),
  garden: () => createPlace(
    '지리산정원',
    '야생화와 자연',
    stockPhoto('photo-1490750967868-88aa4486c946'),
    35.2522,
    127.4931,
    '전라남도 구례군 마산면 화엄사로 377-37',
    '야생화와 생태숲을 따라 걸으며 지리산의 계절을 가까이 만나요.',
  ),
  cornelian: () => createPlace(
    '산수유문화관',
    '산수유 이야기',
    stockPhoto('photo-1462275646964-a0e3386b89fa'),
    35.3154,
    127.4368,
    '전라남도 구례군 산동면 상관1길 45',
    '구례 산수유의 역사와 향을 만나고 따뜻한 산수유차로 쉬어가요.',
  ),
  hwaeomsa: () => createPlace(
    '화엄사',
    '고요한 사찰',
    stockPhoto('photo-1500530855697-b586d89ba3ee'),
    35.2561,
    127.4986,
    '전라남도 구례군 마산면 화엄사로 539',
    '웅장한 가람과 계곡 숲길을 함께 거닐며 구례의 깊은 시간을 느껴요.',
  ),
  history: () => createPlace(
    '지리산역사문화관',
    '구례를 이해하는 시간',
    stockPhoto('photo-1561214115-f2f134cc4912'),
    35.2511,
    127.4928,
    '전라남도 구례군 마산면 화엄사로 377-36',
    '강따라, 산따라, 길따라 이어지는 전시로 지리산권 문화를 알아봐요.',
  ),
};

function postPlace(post, index = 0) {
  const image = post.images[index] ?? post.images[0];
  return createPlace(
    post.name,
    post.menu,
    image.url,
    image.lat,
    image.lng,
    post.address,
    `${post.name}에서 ${post.menu}와 함께 구례의 맛과 풍경을 즐겨요.`,
  );
}

function courseScore(course, tagScores) {
  return course.tags.reduce((score, tag) => score + (tagScores[tag] ?? 0), 0);
}

export function createCourses(post, tagScores = {}) {
  const courses = [
    {
      theme: '섬진강 바람과 한옥에서 쉬어가는 하루',
      description: '로컬푸드로 시작해 대숲과 고택으로 이어지는 구례 릴랙스 코스예요.',
      distance: '차량 약 18km',
      mode: '차량 이동 + 도보 산책',
      tags: ['릴랙스', '한옥카페', '로컬푸드'],
      steps: [postPlace(post), guryePlace.bamboo(), guryePlace.ssangsanje()],
    },
    {
      theme: '산수유와 지리산 자연을 만나는 하루',
      description: '산동의 산수유 이야기부터 야생화 정원까지 색으로 기억하는 코스예요.',
      distance: '차량 약 32km',
      mode: '차량 이동 + 정원 산책',
      tags: ['산수유', '자연', '릴랙스'],
      steps: [guryePlace.cornelian(), guryePlace.garden(), postPlace(post, 1)],
    },
    {
      theme: '화엄사 권역의 역사와 로컬 미식',
      description: '사찰과 지리산 문화, 구례의 한 끼를 한 동선으로 묶은 깊이 있는 코스예요.',
      distance: '차량 약 14km',
      mode: '차량 이동 + 문화 산책',
      tags: ['자연', '전통', '로컬푸드'],
      steps: [guryePlace.hwaeomsa(), guryePlace.history(), postPlace(post, 2)],
    },
  ].filter(isGuryeCourse);

  return courses.sort((a, b) => courseScore(b, tagScores) - courseScore(a, tagScores));
}
