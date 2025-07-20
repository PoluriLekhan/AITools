"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "@/lib/firebase";
import AiToolForm from "@/components/AiToolForm";
import UsefulWebsiteForm from "@/components/UsefulWebsiteForm";
import { Tabs } from "@/components/ui/tabs";
import { Bot, Globe } from "lucide-react";

export default function SubmitPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"ai-tool" | "useful-website">("ai-tool");

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) router.replace("/login");
    });
    return () => unsubscribe();
  }, [router]);

  const tabs = [
    {
      label: "Submit AI Tool",
      value: "ai-tool"
    },
    {
      label: "Submit Useful Website", 
      value: "useful-website"
    }
  ];

  return (
    <>
      <section className="pink_container !min-h-[230px]">
        <h1 className="heading">Submit Your Content</h1>
        <p className="sub-heading !max-w-3xl">
          Share AI tools or useful websites with our community
        </p>
      </section>
      
      <section className="section_container">
        <Tabs 
          tabs={tabs}
          value={activeTab} 
          onChange={(value) => setActiveTab(value as "ai-tool" | "useful-website")} 
          className="w-full"
        />
        
        {activeTab === "ai-tool" && (
          <div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-800 mb-2">AI Tool Submission</h3>
              <p className="text-blue-700 text-sm">
                Submit AI-powered tools, applications, or services that help users solve problems or enhance productivity.
              </p>
            </div>
            <AiToolForm />
          </div>
        )}
        
        {activeTab === "useful-website" && (
          <div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-green-800 mb-2">Useful Website Submission</h3>
              <p className="text-green-700 text-sm">
                Submit helpful websites, resources, or tools that provide value to users (non-AI focused).
              </p>
            </div>
            <UsefulWebsiteForm />
          </div>
        )}
      </section>
    </>
  );
} 