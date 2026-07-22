import { useEffect } from 'react';
import { AdminCategoriesPage } from './pages/AdminCategoriesPage';
import { AuthPage } from './pages/AuthPage';
import { CoursePage } from './pages/CoursePage';
import { DetailPage } from './pages/DetailPage';
import { HomePage } from './pages/HomePage';
import { NewRestaurantPage } from './pages/NewRestaurantPage';
import { SavedPage } from './pages/SavedPage';
import { Footer } from './components/Footer';
import { BackButton } from './components/BackButton';
import { Header } from './components/Header';
import { posts } from './data/posts';
import { useAuth } from './hooks/useAuth';
import { useBookmarks } from './hooks/useBookmarks';
import { useCategories } from './hooks/useCategories';
import { useHashNavigation } from './hooks/useHashNavigation';
import { useRecommendations } from './hooks/useRecommendations';
import { signOut } from './services/authService';

export default function App() {
  const categoryStore = useCategories();
  const auth = useAuth();
  const bookmarkStore = useBookmarks(auth.user);
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
        <AdminCategoriesPage
          categoryStore={categoryStore}
          onHome={() => navigate('home')}
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
          bookmarkedIds={bookmarkStore.bookmarkedIds}
          onHome={() => navigate('home')}
          onOpenPost={(postId) => navigate('post', postId)}
          onToggleBookmark={toggleBookmark}
        />
      );
    }
    if (route.view === 'post' && selectedPost) {
      return (
        <DetailPage
          post={selectedPost}
          bookmarked={bookmarkStore.bookmarkedIds.has(selectedPost.id)}
          onHome={() => navigate('home')}
          onOpenCourse={() => navigate('course', selectedPost.id)}
          onToggleBookmark={toggleBookmark}
        />
      );
    }
    if (route.view === 'course' && selectedPost) {
      return (
        <CoursePage
          post={selectedPost}
          tagScores={tagScores}
          onHome={() => navigate('home')}
          onPost={() => navigate('post', selectedPost.id)}
        />
      );
    }
    return (
      <HomePage
        posts={posts}
        categories={categoryStore.categories}
        recommendedPosts={recommendedPosts}
        hasRecommendationHistory={hasRecommendationHistory}
        bookmarkedIds={bookmarkStore.bookmarkedIds}
        onOpenPost={(postId) => navigate('post', postId)}
        onResetRecommendations={resetRecommendations}
        onSelectTags={recordTags}
        onToggleBookmark={toggleBookmark}
      />
    );
  };

  return (
    <>
      <Header
        user={auth.user}
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
