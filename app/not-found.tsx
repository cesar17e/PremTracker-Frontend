import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";

export default function NotFound() {
  return (
    <PageContainer className="min-h-[70vh] items-center justify-center py-20">
      <div className="glow-panel max-w-xl rounded-[2rem] border border-base-content/8 p-10 text-center">
        <p className="section-kicker justify-center">404</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-base-content">
          This page is off the fixture list
        </h1>
        <p className="mt-4 text-base leading-7 text-base-content/68">
          The route does not exist in the frontend yet, or the URL is incorrect.
        </p>
        <Link href="/" className="btn btn-primary mt-8 rounded-full px-6">
          Back to home
        </Link>
      </div>
    </PageContainer>
  );
}
