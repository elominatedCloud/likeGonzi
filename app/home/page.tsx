import { HomeScreen } from "@/Components/home/HomeScreen";

const states = ["ready", "loading", "empty", "error"] as const;

/**
 * ?state=loading|empty|error 는 디자인 QA용 강제 지정.
 * 없으면 HomeScreen이 /api/home을 직접 불러 실제 상태를 그린다.
 */
export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string }>;
}) {
  const { state } = await searchParams;
  const viewState = states.includes(state as (typeof states)[number])
    ? (state as (typeof states)[number])
    : undefined;

  return <HomeScreen viewState={viewState} />;
}
