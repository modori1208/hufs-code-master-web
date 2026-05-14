import { Link } from 'react-router-dom';
import { FilePlus2, FolderPlus, Users } from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const sections = [
  {
    icon: FilePlus2,
    title: '문제 관리',
    description: '문제 / 테스트케이스를 등록하고 수정합니다.',
    to: '/admin/problems',
  },
  {
    icon: FolderPlus,
    title: '트랙 관리',
    description: '트랙 생성과 문제 배치를 관리합니다.',
    to: '/admin/tracks',
  },
  {
    icon: Users,
    title: '회원 관리',
    description: '회원을 검색하고 권한·차단을 관리합니다.',
    to: '/admin/members',
  },
];

export default function AdminPage() {
  return (
    <>
      <header>
        <h1 className="text-3xl font-bold tracking-tight">대시보드</h1>
        <p className="mt-1 text-muted-foreground">
          데이터 등록과 운영을 위한 콘솔입니다.
        </p>
      </header>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sections.map(({ icon: Icon, title, description, to }) => (
          <Link key={to} to={to} className="group">
            <Card className="h-full transition-colors group-hover:border-primary/50">
              <CardHeader>
                <div className="inline-flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </div>
                <CardTitle className="mt-3">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
