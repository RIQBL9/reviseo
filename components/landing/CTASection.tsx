import { Button } from "@/components/ui/Button";

export function CTASection() {
  return (
    <section className="px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-4xl rounded-[2rem] bg-gradient-to-br from-brand via-brand to-physics px-6 py-14 text-center shadow-[0_30px_60px_-20px_rgba(79,70,229,0.45)] sm:px-12">
        <h2 className="text-balance text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Your next revision session could be your best one yet.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-balance text-white/85">
          Free to start. Set up your subjects in a couple of minutes and get a
          personalised revision plan built around your exam boards.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button href="/signup" size="lg" className="bg-white text-brand-dark hover:bg-white/90">
            Create your free account
          </Button>
        </div>
      </div>
    </section>
  );
}
