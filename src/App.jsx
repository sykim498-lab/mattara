import { lazy, Suspense, useEffect } from 'react';
import { AdminPage } from './pages/AdminPage';
import { AuthPage } from './pages/AuthPage';
import { DetailPage } from './pages/DetailPage';
import { HomePage } from './pages/HomePage';
import { NewRestaurantPage } from './pages/NewRestaurantPage';
import { SavedPage } from './pages/SavedPage';
import { Footer } from './components/Footer';
import { BackButton } from './components/BackButton';
import { Header } from './components/Header';
import { posts as fallbackPosts } from './data/posts';
import { guryeCourses } from './data/guryeCourses';
import { useAuth } from './hooks/useAuth';
import { useAdminAccess } from './hooks/useAdminAccess';
import { useBookmarks } from './hooks/useBookmarks';
import { useCategories } from './hooks/useCategories';
import { useHashNavigation } from './hooks/useHashNavigation';
import { useFirestorePosts } from './hooks/useFirestorePosts';
import { useFirestoreCourses } from './hooks/useFirestoreCourses';
import { useRecommendations } from './hooks/useRecommendations';
import { useSavedCourses } from './hooks/useSavedCourses';
import { signOut } from './services/authService';

const CoursePage = lazy(() => import('./pages/CoursePage').then((module) => ({
  default: module.CoursePage,
})));

export default function App() {
  const categoryStore = useCategories();
  const auth = useAuth();
  const adminAccess = useAdminAccess(auth.user);
  const posts = useFirestorePosts(fallbackPosts);
  const courses = useFirestoreCourses(guryeCourses);
  const bookmarkStore = useBookmarks(auth.user);
  const savedCourseStore = useSavedCourses(auth.user);
  const {
    recommendedPosts,
    hasHistory: hasRecommendationHistory,
    tagScores,
    record: recordRecommendation,
    recordTags,
    reset: resetRecommendations,
  } = useRecommendations(posts);
  const { route, navigate, goBack } = useHashNavigation();
  const selectedPost = posts.find(({ id }) => id === route.postId);

  useEffect(() => {
    if (route.view !== 'post' || !selectedPost) return;
    const key = `mattara.view-recorded.${selectedPost.id}`;
    const lastRecordedAt = Number(sessionStorage.getItem(key) ?? 0);
    if (Date.now() - lastRecordedAt < 5000) return;
    sessionStorage.setItem(key, String(Date.now()));
    recordRecommendation(selectedPost, 'view');
  }, [route.view, selectedPost, recordRecommendation]);

  const toggleBookmark = (post) => {
    if (!bookmarkStore.bookmarkedIds.has(post.id)) {
      recordRecommendation(post, 'bookmark');
    }
    bookmarkStore.toggleBookmark(post.id);
  };

  const renderPage = () => {
    if (route.view === 'admin') {
      return (
        <AdminPage
          user={auth.user}
          access={adminAccess}
          categoryStore={categoryStore}
          onHome={() => navigate('home')}
          onLogin={() => navigate('login')}
        />
      );
    }
    if (route.view === 'login' || route.view === 'signup') {
      return (
        <AuthPage
          key={route.view}
          mode={route.view}
          configured={auth.configured}
          onHome={() => navigate('home')}
          onSwitchMode={() => navigate(route.view === 'login' ? 'signup' : 'login')}
        />
      );
    }
    if (route.view === 'new') {
      return (
        <NewRestaurantPage
          user={auth.user}
          loading={auth.loading}
          onHome={() => navigate('home')}
          onLogin={() => navigate('login')}
        />
      );
    }
    if (route.view === 'saved') {
      return (
        <SavedPage
          posts={posts}
          courses={courses}
          user={auth.user}
          bookmarkedIds={bookmarkStore.bookmarkedIds}
          savedCourseIds={savedCourseStore.savedCourseIds}
          onHome={() => navigate('home')}
          onOpenPost={(postId) => navigate('post', postId)}
          onToggleBookmark={toggleBookmark}
          onOpenCourse={(courseId) => navigate('course', courseId)}
          onToggleCourseSave={savedCourseStore.toggle}
        />
      );
    }
    if (route.view === 'post' && selectedPost) {
      return (
        <DetailPage
          post={selectedPost}
          user={auth.user}
          bookmarked={bookmarkStore.bookmarkedIds.has(selectedPost.id)}
          onHome={() => navigate('home')}
          onOpenCourse={() => navigate('course')}
          onToggleBookmark={toggleBookmark}
        />
      );
    }
    if (route.view === 'course') {
      return (
        <Suspense fallback={<div className="view shell">구례 코스를 불러오는 중...</div>}>
          <CoursePage
            post={selectedPost}
            sourceCourses={courses}
            initialCourseId={route.courseId}
            isCourseSaved={(courseId) => savedCourseStore.savedCourseIds.has(courseId)}
            onToggleCourseSave={savedCourseStore.toggle}
            tagScores={tagScores}
            onHome={() => navigate('home')}
            onPost={selectedPost ? () => navigate('post', selectedPost.id) : undefined}
          />
        </Suspense>
      );
    }
    return (
      <HomePage
        posts={posts}
        courses={courses}
        user={auth.user}
        categories={categoryStore.categories}
        recommendedPosts={recommendedPosts}
        hasRecommendationHistory={hasRecommendationHistory}
        bookmarkedIds={bookmarkStore.bookmarkedIds}
        savedCourseIds={savedCourseStore.savedCourseIds}
        onOpenCourses={() => navigate('course')}
        onOpenCourse={(courseId) => navigate('course', courseId)}
        onOpenPost={(postId) => navigate('post', postId)}
        onResetRecommendations={resetRecommendations}
        onSelectTags={recordTags}
        onToggleBookmark={toggleBookmark}
        onToggleCourseSave={savedCourseStore.toggle}
      />
    );
  };

  return (
    <>
      <Header
        user={auth.user}
        isAdmin={adminAccess.isAdmin}
        onHome={() => navigate('home')}
        onAdmin={() => navigate('admin')}
        onNewPost={() => navigate('new')}
        onSaved={() => navigate('saved')}
        onAuth={() => navigate('login')}
        onSignOut={signOut}
      />
      {route.view !== 'home' && <BackButton onClick={goBack} />}
      <main>{renderPage()}</main>
      <Footer />
    </>
  );
}
