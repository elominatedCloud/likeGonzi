import Image from "next/image";

export default function Loading() {
  return (
    <main className="visetos-bg flex min-h-dvh items-center justify-center px-6">
      <div className="text-center" role="status" aria-live="polite">
        <Image src="/icon/MCM_Logo.svg" alt="MCM" width={58} height={58} priority/>
        <span className="mx-auto mt-5 block h-5 w-5 animate-spin rounded-full border-2 border-cognac/20 border-t-cognac" aria-hidden="true"/>
        <p className="mt-3 text-[12px] text-muted">Storybook을 불러오고 있어요.</p>
      </div>
    </main>
  );
}
