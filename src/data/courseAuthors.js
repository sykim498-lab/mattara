const AUTHORS = [
  ['지리산산책자', '@jirisan_walk', 'photo-1527980965255-d3b416303d12'],
  ['강따라구례', '@seomjin_drive', 'photo-1534528741775-53994a69daeb'],
  ['피아골여행자', '@piagol_day', 'photo-1500648767791-00dcc994a43e'],
  ['구례한입', '@gurye_bite', 'photo-1494790108377-be9c29b29330'],
  ['읍내뚜벅이', '@gurye_walker', 'photo-1531123897727-8f129e1688ce'],
  ['산수유기록', '@yellow_gurye', 'photo-1539571696357-5a69c17a67c6'],
  ['섬진강바람', '@river_breeze', 'photo-1507003211169-0a1dd7228f2d'],
  ['오미마을일기', '@omi_slowtrip', 'photo-1535713875002-d1d0cf377fde'],
];

export function courseAuthor(course) {
  const [name, handle, imageId] = AUTHORS[(course.number - 1) % AUTHORS.length];
  return {
    name: course.author ?? name,
    handle: course.handle ?? handle,
    avatar: course.avatar
      ?? `https://images.unsplash.com/${imageId}?auto=format&fit=crop&w=100&q=80`,
  };
}
