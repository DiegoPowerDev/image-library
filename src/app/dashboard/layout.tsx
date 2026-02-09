export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className={`flex h-screen justify-center bg-black overflow-hidde w-screen overflow-x-hidden`}
    >
      {children}
    </div>
  );
}
