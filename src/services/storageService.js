import { getFirebaseStorage } from './firebase';

function safeFileName(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '-');
}

export async function uploadPostImages(userId, submissionId, photos) {
  if (!photos.length) return [];
  const storage = await getFirebaseStorage();
  const { getDownloadURL, ref, uploadBytes } = await import('firebase/storage');
  return Promise.all(photos.map(async (photo, index) => {
    const path = `post-images/${userId}/${submissionId}/${index}-${safeFileName(photo.file.name)}`;
    const snapshot = await uploadBytes(ref(storage, path), photo.file, {
      contentType: photo.file.type,
    });
    return {
      url: await getDownloadURL(snapshot.ref),
      comment: photo.comment.trim(),
      lat: Number(photo.lat) || null,
      lng: Number(photo.lng) || null,
      order: index,
    };
  }));
}
