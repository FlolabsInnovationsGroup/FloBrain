import Footer from "@/components/layout/footer";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Navbar removed from here because it's now in the root layout */}
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  );
}
