import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Container } from '@/components/layout/Container';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { AuthCallbackPage } from '@/pages/AuthCallbackPage';
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/LoginPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { ProblemDetailPage } from '@/pages/ProblemDetailPage';
import { ProblemsPage } from '@/pages/ProblemsPage';
import { SubmissionsPage } from '@/pages/SubmissionsPage';
import { TrackDetailPage } from '@/pages/TrackDetailPage';
import { TracksPage } from '@/pages/TracksPage';

// 관리자 코드는 lazy 로드. 자식 라우트 정의는 AdminLayout 내부에서 처리하므로
// 일반 사용자 메인 번들에는 admin 의 세부 경로/페이지 식별자가 노출되지 않습니다.
const AdminLayout = lazy(() => import('@/components/layout/AdminLayout'));

function AdminFallback() {
  return (
    <Container className="flex items-center justify-center py-32 text-muted-foreground">
      <Loader2 className="mr-2 size-5 animate-spin" />
      불러오는 중...
    </Container>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />

        {/* Authenticated only */}
        <Route
          path="/problems"
          element={
            <RequireAuth>
              <ProblemsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/problems/:id"
          element={
            <RequireAuth>
              <ProblemDetailPage />
            </RequireAuth>
          }
        />
        <Route
          path="/tracks"
          element={
            <RequireAuth>
              <TracksPage />
            </RequireAuth>
          }
        />
        <Route
          path="/tracks/:id"
          element={
            <RequireAuth>
              <TrackDetailPage />
            </RequireAuth>
          }
        />
        <Route
          path="/submissions"
          element={
            <RequireAuth>
              <SubmissionsPage />
            </RequireAuth>
          }
        />

        {/* Admin only — descendant routes 패턴.
            세부 경로/페이지 컴포넌트는 lazy 청크 안에서만 정의됩니다. */}
        <Route
          path="/admin/*"
          element={
            <RequireAuth adminOnly>
              <Suspense fallback={<AdminFallback />}>
                <AdminLayout />
              </Suspense>
            </RequireAuth>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
