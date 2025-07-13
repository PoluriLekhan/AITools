"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "@/lib/firebase";
import AiToolForm from "@/components/AiToolForm";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) router.replace("/login");
    });
    return () => unsubscribe();
  }, [router]);

  return (
    <>
      <section className="pink_container !min-h-[230px]">
        <h1 className="heading">Submit Your AI Tool</h1>
      </section>
      <AiToolForm />
    </>
  );
}
