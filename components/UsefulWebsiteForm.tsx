"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";


const UsefulWebsiteForm = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pitch, setPitch] = useState("");
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth();
  const [isPending, setIsPending] = useState(false);


  interface UsefulWebsiteFormState {
    error: string;
    status: string;
    _id?: string;
  }

  const [state, setState] = useState<UsefulWebsiteFormState>({ error: "", status: "INITIAL" });

  const handleFormSubmit = async (formData: FormData) => {
    try {
      console.log("Form submission started");
      
      const formValues = {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        category: formData.get("category") as string,
        websiteURL: formData.get("websiteURL") as string,
        websiteImage: "/logo.png", // Default image
        pitch,
      };

      console.log("Form values:", formValues);

      // Basic validation
      if (!formValues.title?.trim()) {
        setErrors({ title: "Title is required" });
        return { error: "Title is required", status: "ERROR" };
      }

      if (!formValues.description?.trim()) {
        setErrors({ description: "Description is required" });
        return { error: "Description is required", status: "ERROR" };
      }

      if (!formValues.category?.trim()) {
        setErrors({ category: "Category is required" });
        return { error: "Category is required", status: "ERROR" };
      }

      if (!formValues.websiteURL?.trim()) {
        setErrors({ websiteURL: "Website URL is required" });
        return { error: "Website URL is required", status: "ERROR" };
      }

      if (!user) {
        console.log("User not authenticated");
        toast({ 
          title: "Error", 
          description: "You must be logged in to submit a useful website.",
          variant: "destructive"
        });
        return { error: "User not authenticated", status: "ERROR" };
      }

      if (!user.uid) {
        console.log("User UID not available");
        toast({ 
          title: "Error", 
          description: "User authentication incomplete. Please try logging out and back in.",
          variant: "destructive"
        });
        return { error: "User UID not available", status: "ERROR" };
      }

      console.log("User authenticated:", user.uid);
      
      // Create a clean user object to avoid circular references
      const cleanUser = {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
      };
      
      console.log("Creating useful website...");
      
      // Call the API to create the useful website
      const response = await fetch("/api/useful-websites/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formValues.title,
          description: formValues.description,
          category: formValues.category,
          websiteURL: formValues.websiteURL,
          websiteImage: "/logo.png",
          pitch: formValues.pitch,
          authorId: user.uid,
        }),
      });

      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        console.error("Error parsing response:", parseError);
        toast({
          title: "Error",
          description: "Invalid server response. Please try again.",
          variant: "destructive",
        });
        return { error: "Invalid server response", status: "ERROR", _id: "" };
      }
      console.log("Useful website creation result:", result);

      if (!response.ok) {
        console.error("API Error:", result);
        toast({
          title: "Error",
          description: result.error || `Server error: ${response.status}`,
          variant: "destructive",
        });
        return { error: result.error || "Server error", status: "ERROR", _id: "" };
      }

      if (result.success) {
        toast({
          title: "Success",
          description: result.message || "Your useful website submission has been created successfully and is pending admin approval",
        });

        // Create a new useful website object for the profile update
        const newWebsite = {
          _id: result._id,
          title: formValues.title,
          _createdAt: new Date().toISOString(),
          author: {
            _id: user.uid,
            name: user.displayName || "Unknown User",
            image: user.photoURL || "",
            bio: "",
          },
          views: 0,
          description: formValues.description,
          category: formValues.category,
          image: formValues.websiteImage || "/logo.png",
          websiteURL: formValues.websiteURL,
          status: "pending",
        };

        // Dispatch custom event to notify profile page of new submission
        const event = new CustomEvent('new-useful-website-submitted', {
          detail: newWebsite
        });
        window.dispatchEvent(event);

        // Redirect to user's profile page with success parameter
        if (user.email) {
          router.push(`/user/${encodeURIComponent(user.email)}?newSubmission=true`);
        } else {
          router.push(`/useful-websites/${result._id}`);
        }

        return { status: "SUCCESS", _id: result._id, error: "" };
      } else {
        console.error("Failed to create useful website:", result.error);
        toast({
          title: "Error",
          description: result.error || "Failed to create useful website",
          variant: "destructive",
        });
        return { error: result.error || "Failed to create useful website", status: "ERROR", _id: "" };
      }
    } catch (error) {
      console.error("Form submission error:", error);
      
      toast({
        title: "Error",
        description: "An unexpected error has occurred",
        variant: "destructive",
      });

      return {
        error: "An unexpected error has occurred",
        status: "ERROR",
      };
    }
  };

  const formAction = async (formData: FormData) => {
    setIsPending(true);
    const result = await handleFormSubmit(formData);
    setState(result);
    setIsPending(false);
  };

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        formAction(new FormData(e.currentTarget));
      }}
      className="ai-tool-form"
    >
      <div>
        <label htmlFor="title" className="ai-tool-form_label">
          Website Title
        </label>
        <Input
          id="title"
          name="title"
          className="ai-tool-form_input"
          required
          placeholder="Useful Website Name"
        />
        {errors.title && <p className="ai-tool-form_error">{errors.title}</p>}
      </div>

      <div>
        <label htmlFor="description" className="ai-tool-form_label">
          Description
        </label>
        <Textarea
          id="description"
          name="description"
          className="ai-tool-form_textarea"
          required
          placeholder="Brief description of the useful website"
        />
        {errors.description && (
          <p className="ai-tool-form_error">{errors.description}</p>
        )}
      </div>

      <div>
        <label htmlFor="category" className="ai-tool-form_label">
          Category
        </label>
        <Input
          id="category"
          name="category"
          className="ai-tool-form_input"
          required
          placeholder="Enter category (e.g., Productivity, Education, Entertainment, etc.)"
        />
        {errors.category && (
          <p className="ai-tool-form_error">{errors.category}</p>
        )}
      </div>

      <div>
        <label htmlFor="websiteURL" className="ai-tool-form_label">
          Website URL
        </label>
        <Input
          id="websiteURL"
          name="websiteURL"
          type="url"
          className="ai-tool-form_input"
          required
          placeholder="https://example.com"
        />
        {errors.websiteURL && <p className="ai-tool-form_error">{errors.websiteURL}</p>}
      </div>



      <div>
        <label htmlFor="pitch" className="ai-tool-form_label">
          Why is this website useful?
        </label>
        <Textarea
          id="pitch"
          name="pitch"
          className="ai-tool-form_textarea"
          value={pitch}
          onChange={(e) => setPitch(e.target.value)}
          placeholder="Explain why this website is useful and what problems it solves"
        />
        {errors.pitch && <p className="ai-tool-form_error">{errors.pitch}</p>}
      </div>

      <Button
        type="submit"
        className="ai-tool-form_btn text-white"
        disabled={isPending}
      >
        {isPending ? "Submitting..." : "Submit Useful Website"}
        <Send className="size-6 ml-2" />
      </Button>
    </form>
  );
};

export default UsefulWebsiteForm; 