export function getPostUrl(postId) {
  return `${location.origin}${location.pathname}#/post/${postId}`;
}

export async function copyPostLink(postId) {
  const url = getPostUrl(postId);
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(url);
  } else {
    const input = document.createElement('textarea');
    input.value = url;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    input.remove();
  }
  return url;
}

export async function sharePost(post) {
  const url = getPostUrl(post.id);
  if (!navigator.share) return false;
  await navigator.share({ title: `${post.name} | 맛따라`, text: post.caption, url });
  return true;
}

export function getSocialShareUrl(provider, post) {
  const url = encodeURIComponent(getPostUrl(post.id));
  const text = encodeURIComponent(`${post.name} | 맛따라`);
  if (provider === 'x') return `https://x.com/intent/post?url=${url}&text=${text}`;
  return `https://www.facebook.com/sharer/sharer.php?u=${url}`;
}
