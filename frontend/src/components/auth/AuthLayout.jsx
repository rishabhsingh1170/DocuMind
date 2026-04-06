import BrandPanel from "./BrandPanel";

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col md:flex-row">
        <section className="flex w-full items-center justify-center bg-white px-6 py-10 sm:px-10 md:w-[54%] lg:w-1/2 lg:px-14">
          <div className="w-full max-w-md space-y-8">{children}</div>
        </section>
        <BrandPanel />
      </div>
    </div>
  );
}
