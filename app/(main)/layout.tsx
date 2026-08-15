import BottomBar from '@/Components/BottomBar/BottomBar';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <main>{children}</main>
      <BottomBar />
    </>
  );
}