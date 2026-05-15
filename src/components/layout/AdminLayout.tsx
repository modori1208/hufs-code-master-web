import { Suspense, lazy } from 'react';
import { NavLink, Route, Routes } from 'react-router-dom';
import {
  Code2,
  FilePlus2,
  FolderPlus,
  LayoutDashboard,
  Loader2,
  Server,
  Users,
} from 'lucide-react';
import { Container } from './Container';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { cn } from '@/lib/utils';

// 모든 admin 페이지는 이 lazy 그룹에서 로드됩니다.
// 메인 번들에 path/컴포넌트 식별자가 노출되지 않도록 라우트 정의를 여기 안에 가둡니다.
const AdminPage = lazy(() => import('@/pages/AdminPage'));
const AdminProblemsPage = lazy(() => import('@/pages/AdminProblemsPage'));
const AdminProblemEditPage = lazy(() => import('@/pages/AdminProblemEditPage'));
const AdminTracksPage = lazy(() => import('@/pages/AdminTracksPage'));
const AdminTrackEditPage = lazy(() => import('@/pages/AdminTrackEditPage'));
const AdminMembersPage = lazy(() => import('@/pages/AdminMembersPage'));
const AdminJudgehostsPage = lazy(() => import('@/pages/AdminJudgehostsPage'));
const AdminLanguagesPage = lazy(() => import('@/pages/AdminLanguagesPage'));

const navItems = [
  { to: '/admin', label: '대시보드', icon: LayoutDashboard, end: true },
  { to: '/admin/problems', label: '문제', icon: FilePlus2, end: false },
  { to: '/admin/tracks', label: '트랙', icon: FolderPlus, end: false },
  { to: '/admin/members', label: '회원', icon: Users, end: false },
  { to: '/admin/judgehosts', label: 'Judgehost', icon: Server, end: false },
  { to: '/admin/languages', label: '언어', icon: Code2, end: false },
];

export default function AdminLayout() {
  return (
    <Container className="py-10">
      <div className="grid gap-8 lg:grid-cols-[200px_1fr]">
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            관리자
          </h2>
          <nav className="flex flex-row gap-1 lg:flex-col">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                    'hover:bg-accent hover:text-accent-foreground',
                    isActive
                      ? 'bg-accent text-accent-foreground font-medium'
                      : 'text-muted-foreground',
                  )
                }
              >
                <Icon className="size-4" />
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <div className="min-w-0">
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-32 text-muted-foreground">
                <Loader2 className="mr-2 size-5 animate-spin" />
                불러오는 중...
              </div>
            }
          >
            <Routes>
              <Route index element={<AdminPage />} />
              <Route path="problems" element={<AdminProblemsPage />} />
              <Route path="problems/new" element={<AdminProblemEditPage />} />
              <Route path="problems/:id/edit" element={<AdminProblemEditPage />} />
              <Route path="tracks" element={<AdminTracksPage />} />
              <Route path="tracks/new" element={<AdminTrackEditPage />} />
              <Route path="tracks/:id/edit" element={<AdminTrackEditPage />} />
              <Route path="members" element={<AdminMembersPage />} />
              <Route path="judgehosts" element={<AdminJudgehostsPage />} />
              <Route path="languages" element={<AdminLanguagesPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </div>
      </div>
    </Container>
  );
}
