import { useState, type SyntheticEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw, Search } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  listAdminAuditLogActions,
  listAdminAuditLogs,
} from '@/features/admin/api/admin';
import { isFirstPage, isLastPage } from '@/lib/api/types';
import type { AdminAuditLog } from '@/lib/api/types';

// shadcn Select 는 빈 문자열을 SelectItem value 로 허용하지 않아 sentinel 사용.
const ALL_ACTIONS = '__all__';

type Filters = {
  memberId: string;
  action: string;
  from: string;
  to: string;
};

const EMPTY_FILTERS: Filters = {
  memberId: '',
  action: '',
  from: '',
  to: '',
};

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('ko-KR', { hour12: false });
  } catch {
    return iso;
  }
}

/**
 * datetime-local 의 "YYYY-MM-DDTHH:MM" 을 백엔드가 받는 "YYYY-MM-DDTHH:MM:00" 으로 보정.
 */
function normalizeDateTime(value: string): string | undefined {
  if (!value) return undefined;
  return value.length === 16 ? `${value}:00` : value;
}

export default function AdminAuditLogsPage() {
  const [draft, setDraft] = useState<Filters>(EMPTY_FILTERS);
  const [applied, setApplied] = useState<Filters>(EMPTY_FILTERS);
  const [page, setPage] = useState(0);

  const actionsQuery = useQuery({
    queryKey: ['admin', 'audit-logs', 'actions'],
    queryFn: listAdminAuditLogActions,
    staleTime: 60_000,
  });

  const memberIdNum = applied.memberId.trim()
    ? Number(applied.memberId.trim())
    : undefined;
  const memberIdParam =
    typeof memberIdNum === 'number' && Number.isFinite(memberIdNum)
      ? memberIdNum
      : undefined;

  const query = useQuery({
    queryKey: ['admin', 'audit-logs', { page, ...applied }],
    queryFn: () =>
      listAdminAuditLogs({
        page,
        size: 30,
        sort: 'createdAt,desc',
        memberId: memberIdParam,
        action: applied.action.trim() || undefined,
        from: normalizeDateTime(applied.from),
        to: normalizeDateTime(applied.to),
      }),
  });

  const handleApply = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setApplied(draft);
    setPage(0);
  };

  const handleReset = () => {
    setDraft(EMPTY_FILTERS);
    setApplied(EMPTY_FILTERS);
    setPage(0);
  };

  return (
    <>
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">감사 로그</h1>
          <p className="mt-1 text-muted-foreground">
            유저/관리자의 주요 행동 기록. 최신순으로 정렬되어 있습니다.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => query.refetch()}
          disabled={query.isFetching}
        >
          <RefreshCw className={query.isFetching ? 'size-4 animate-spin' : 'size-4'} />
          새로고침
        </Button>
      </header>

      <Alert className="mt-6">
        <AlertDescription>
          <p>
            기록 범위: write 계열 요청(POST/PUT/PATCH/DELETE) + 로그인/로그아웃 + 모든
            관리자 호출. 일반 GET 트래픽은 기록하지 않습니다.
          </p>
        </AlertDescription>
      </Alert>

      <form onSubmit={handleApply} className="mt-6 grid gap-3 sm:grid-cols-[1fr_1fr_1fr_1fr_auto_auto]">
        <div className="grid gap-1.5">
          <Label htmlFor="filter-member">회원 ID</Label>
          <Input
            id="filter-member"
            type="number"
            min={1}
            value={draft.memberId}
            onChange={(e) => setDraft({ ...draft, memberId: e.target.value })}
            placeholder="예: 42"
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="filter-action">행위 (action)</Label>
          <Select
            value={draft.action === '' ? ALL_ACTIONS : draft.action}
            onValueChange={(v) =>
              setDraft({ ...draft, action: v === ALL_ACTIONS ? '' : v })
            }
          >
            <SelectTrigger id="filter-action">
              <SelectValue placeholder="(전체)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_ACTIONS}>(전체)</SelectItem>
              {actionsQuery.data?.map((a) => (
                <SelectItem key={a} value={a}>
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="filter-from">시작 시각</Label>
          <Input
            id="filter-from"
            type="datetime-local"
            value={draft.from}
            onChange={(e) => setDraft({ ...draft, from: e.target.value })}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="filter-to">종료 시각</Label>
          <Input
            id="filter-to"
            type="datetime-local"
            value={draft.to}
            onChange={(e) => setDraft({ ...draft, to: e.target.value })}
          />
        </div>
        <div className="flex items-end">
          <Button type="submit" variant="secondary">
            <Search className="size-4" />
            조회
          </Button>
        </div>
        <div className="flex items-end">
          <Button type="button" variant="ghost" onClick={handleReset}>
            초기화
          </Button>
        </div>
      </form>

      <div className="mt-4 overflow-hidden rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">#</TableHead>
              <TableHead className="w-48">시각</TableHead>
              <TableHead className="w-24">회원</TableHead>
              <TableHead className="w-56">행위</TableHead>
              <TableHead>대상</TableHead>
              <TableHead className="w-72">요청</TableHead>
              <TableHead className="w-36">IP</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={7}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : query.isError ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <Alert variant="destructive">
                    <AlertDescription>감사 로그를 불러오지 못했습니다.</AlertDescription>
                  </Alert>
                </TableCell>
              </TableRow>
            ) : query.data && query.data.content.length > 0 ? (
              query.data.content.map((row) => <AuditRow key={row.id} log={row} />)
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  조건에 맞는 기록이 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {query.data && query.data.page.total_pages > 1 ? (
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <p>
            {query.data.page.number + 1} / {query.data.page.total_pages} 페이지 (총{' '}
            {query.data.page.total_elements}건)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={isFirstPage(query.data)}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              이전
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={isLastPage(query.data)}
              onClick={() => setPage((p) => p + 1)}
            >
              다음
            </Button>
          </div>
        </div>
      ) : null}
    </>
  );
}

function AuditRow({ log }: { log: AdminAuditLog }) {
  return (
    <TableRow>
      <TableCell className="font-mono text-xs text-muted-foreground">
        {log.id}
      </TableCell>
      <TableCell className="text-xs">{formatDateTime(log.created_at)}</TableCell>
      <TableCell className="font-mono text-xs">
        {log.member_id ?? <span className="text-muted-foreground">-</span>}
      </TableCell>
      <TableCell>
        <Badge variant="secondary" className="font-mono text-[11px]">
          {log.action}
        </Badge>
      </TableCell>
      <TableCell className="text-xs">
        {log.target_type || log.target_id ? (
          <div className="flex flex-col">
            <span className="font-medium">{log.target_type ?? '-'}</span>
            <span className="font-mono text-muted-foreground">
              {log.target_id ?? '-'}
            </span>
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </TableCell>
      <TableCell className="font-mono text-[11px]">
        {log.http_method ? (
          <div className="flex flex-col">
            <span className="font-medium">{log.http_method}</span>
            <span className="truncate text-muted-foreground" title={log.uri ?? undefined}>
              {log.uri ?? '-'}
            </span>
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </TableCell>
      <TableCell className="font-mono text-[11px] text-muted-foreground">
        {log.ip ?? '-'}
      </TableCell>
    </TableRow>
  );
}
