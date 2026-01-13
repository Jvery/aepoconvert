import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center gap-8 py-32 px-16 bg-white dark:bg-black">
        <h1 className="text-4xl font-bold tracking-tight text-black dark:text-zinc-50">
          aepoconvert
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          Free online file converter
        </p>
        <div className="flex gap-4">
          <Button>Get Started</Button>
          <Button variant="outline">Learn More</Button>
        </div>
      </main>
    </div>
  );
}
