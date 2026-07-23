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
      title: photo.title?.trim() || '',
      description: photo.description?.trim() || photo.comment?.trim() || '',
      comment: photo.description?.trim() || photo.comment?.trim() || '',
      address: photo.address?.trim() || '',
      lat: Number(photo.lat) || null,
      lng: Number(photo.lng) || null,
      placeId: photo.placeId || '',
      googleMapsUri: photo.googleMapsUri || '',
      website: photo.website || '',
      placeSource: photo.placeSource || '',
      order: index,
    };
  }));
}
