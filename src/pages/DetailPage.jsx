import { useEffect, useState } from 'react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { CommentsSection } from '../components/CommentsSection';
import { DetailMap } from '../components/DetailMap';
import { PostAuthor } from '../components/PostAuthor';
import { RelatedCourses } from '../components/RelatedCourses';
import { ShareActions } from '../components/ShareActions';
import { TagList } from '../components/TagList';
import { buildDirectionsUrl, lookupPlaceDetails } from '../services/placeService';

const numberFormatter = new Intl.NumberFormat('ko-KR');

export function DetailPage({
  post,
  authorProfile,
  user,
  bookmarked,
  bookmarkCount = 0,
  liked = false,
  likeCount = 0,
  relatedCourses = [],
  hasRecommendationHistory = false,
  onHome,
  onOpenCourse,
  onResetRecommendations = () => {},
  onToggleBookmark,
  onToggleLike = () => {},
}) {
  const [imageIndex, setImageIndex] = useState(0);
  const [livePlace, setLivePlace] = useState(null);
  const image = post.images[imageIndex];
  const moveImage = (offset) => {
    setImageIndex((current) =>
      (current + offset + post.images.length) % post.images.length,
    );
  };
  const mappedImage = post.images.find(({ lat, lng }) => Number.isFinite(lat) && Number.isFinite(lng));
  const place = { ...post, ...livePlace };
  const directionsUrl = buildDirectionsUrl({
    name: post.name,
    address: post.address,
    lat: livePlace?.lat ?? mappedImage?.lat,
    lng: livePlace?.lng ?? mappedImage?.lng,
    placeId: livePlace?.placeId || post.placeId,
  });

  useEffect(() => {
    let active = true;
    lookupPlaceDetails(post.name, post.address)
      .then((details) => { if (active) setLivePlace(details); })
      .catch(() => {});
    return () => { active = false; };
  }, [post.address, post.id, post.name]);

  return (
    <section className="view">
      <div className="shell">
        <Breadcrumbs items={[{ label: '홈 피드', onClick: onHome }, { label: post.name }]} />
        <div className="detail-layout">
          <article className="panel">
            <div className="detail-image">
              <img src={image.url} alt={`${post.name} 사진 ${imageIndex + 1}`} />
              <span className="place-badge">⌖ {post.region}</span>
              <button
                className="circle-btn prev"
                type="button"
                onClick={() => moveImage(-1)}
                aria-label="이전 사진"
              >‹</button>
              <button
                className="circle-btn next"
                type="button"
                onClick={() => moveImage(1)}
                aria-label="다음 사진"
              >›</button>
              <div className="dots">
                {post.images.map((item, index) => (
                  <button
                    className={`dot${index === imageIndex ? ' active' : ''}`}
                    type="button"
                    onClick={() => setImageIndex(index)}
                    aria-label={`${index + 1}번 사진`}
                    key={item.url}
                  />
                ))}
              </div>
            </div>
            <div className="image-comment" aria-live="polite" aria-atomic="true">
              <span>{imageIndex + 1} / {post.images.length}</span>
              <p>{image.comment ?? `${post.name}의 ${imageIndex + 1}번째 사진이에요.`}</p>
            </div>
            <div className="detail-copy">
              <PostAuthor post={post} profile={authorProfile} showRegion />
              <h1>{post.name}</h1>
              <p>
                {post.caption}
                <br /><br />
                대표 메뉴인 <b>{post.menu}</b>는 재료의 개성이 선명하면서도 균형이
                좋아요. 처음 방문한다면 가장 먼저 추천하고 싶은 선택이에요.
              </p>
              <TagList tags={post.tags} />
              <a className="nav-btn detail-nav-btn" href={directionsUrl} target="_blank" rel="noreferrer">
                이 장소로 길찾기
              </a>
              <div className="social">
                <button
                  className={`like-button${liked ? ' active' : ''}`}
                  type="button"
                  onClick={() => onToggleLike(post)}
                  aria-pressed={liked}
                >
                  {liked ? '♥' : '♡'} 좋아요 {numberFormatter.format(likeCount)}
                </button>
                <span>☵ 댓글 {post.comments}</span>
                <span className="bookmark-count">저장 {numberFormatter.format(bookmarkCount)}</span>
                <button
                  className={`bookmark-button${bookmarked ? ' active' : ''}`}
                  type="button"
                  onClick={() => onToggleBookmark(post)}
                  aria-pressed={bookmarked}
                >
                  {bookmarked ? '🔖 저장됨' : '♡ 북마크'}
                </button>
              </div>
              <ShareActions post={post} />
              <CommentsSection feedId={`post-${post.id}`} user={user} />
            </div>
          </article>
          <aside className="panel map-panel">
            <DetailMap post={post} imageIndex={imageIndex} />
            <div className="place-info">
              <p className="eyebrow">PLACE INFORMATION</p>
              <h2>{post.name}</h2>
              <p className="address">⌖ {post.address}</p>
              <div className="info-list">
                <div className="info-row"><b>영업시간</b><span>{place.hours || '방문 전 운영시간 확인'}</span></div>
                <div className="info-row"><b>전화번호</b><span>{place.phone || '매장 문의'}</span></div>
                <div className="info-row"><b>대표 메뉴</b><span>{post.menu}</span></div>
                {place.website && <div className="info-row"><b>웹사이트</b><a href={place.website} target="_blank" rel="noreferrer">방문하기</a></div>}
              </div>
              {(livePlace?.source || post.placeSource) && (
                <small className="place-source">장소 정보: {livePlace?.source || post.placeSource}</small>
              )}
              <a className="nav-btn" href={directionsUrl} target="_blank" rel="noreferrer">
                길찾기 연결하기 ↗
              </a>
            </div>
          </aside>
        </div>
        <RelatedCourses
          source={post}
          courses={relatedCourses}
          hasPreferenceHistory={hasRecommendationHistory}
          description={`${authorProfile?.displayName ?? post.author}님의 게시물 태그와 저장된 취향을 바탕으로 골랐어요.`}
          onOpenCourse={onOpenCourse}
          onResetPreferences={onResetRecommendations}
        />
        <div className="course-banner">
          <div>
            <p className="eyebrow">MAT-TARA CURATION</p>
            <h2>이 장소에서 시작하는 구례 하루</h2>
            <p>구례군 안에서 이어지는 맛집·자연·문화 동선을 추천해 드려요.</p>
          </div>
          <button type="button" onClick={() => onOpenCourse()}>코스 추천하기 →</button>
        </div>
      </div>
    </section>
  );
}
