"use client";

import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import MDEditor from "@uiw/react-md-editor";
import { Button } from "@/components/ui/button";
import { Send, Plus, X, Check } from "lucide-react";
import { formSchema } from "@/lib/validation";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { createAiTool } from "@/lib/actions";
import { useAuth } from "@/components/AuthProvider";
import { fetchAIToolTitlesAndURLs } from "@/lib/sanity-client";
import { writeClient } from "@/sanity/lib/write-client";

const AiToolForm = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pitch, setPitch] = useState("");
  const [customType, setCustomType] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [availableTypes, setAvailableTypes] = useState<string[]>(["Free", "Paid", "Credit-Based"]);
  const customTypeInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth();
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [isPending, setIsPending] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [imageUrlInput, setImageUrlInput] = useState<string>("");

  interface AiToolFormState {
    error: string;
    status: string;
    _id?: string;
  }

  const [state, setState] = useState<AiToolFormState>({ error: "", status: "INITIAL" });

  const handleTypeChange = (type: string) => {
    if (type === "Custom Type") {
      setIsAddingCustom(true);
      setShowCustomInput(true);
      // Focus the input after a short delay to ensure it's rendered
      setTimeout(() => {
        customTypeInputRef.current?.focus();
      }, 100);
    } else {
      setSelectedTypes((prev) =>
        prev.includes(type)
          ? prev.filter((t) => t !== type)
          : [...prev, type]
      );
    }
  };

  const handleCustomTypeChange = (value: string) => {
    setCustomType(value);
  };

  const handleAddCustomType = () => {
    const trimmedType = customType.trim();
    if (!trimmedType) {
      toast({
        title: "Error",
        description: "Please enter a custom type name",
        variant: "destructive",
      });
      return;
    }

    // Check if the custom type already exists
    if (availableTypes.includes(trimmedType)) {
      toast({
        title: "Error",
        description: "This type already exists",
        variant: "destructive",
      });
      return;
    }

    // Add the custom type to available types
    setAvailableTypes(prev => [...prev, trimmedType]);
    
    // Select the new custom type
    setSelectedTypes(prev => [...prev, trimmedType]);
    
    // Reset custom type input
    setCustomType("");
    setShowCustomInput(false);
    setIsAddingCustom(false);
    
    toast({
      title: "Success",
      description: `"${trimmedType}" has been added and selected`,
    });
  };

  const handleRemoveCustomType = (typeToRemove: string) => {
    // Remove from selected types
    setSelectedTypes(prev => prev.filter(t => t !== typeToRemove));
    
    // Remove from available types (only if it's a custom type)
    if (!["Free", "Paid", "Credit-Based"].includes(typeToRemove)) {
      setAvailableTypes(prev => prev.filter(t => t !== typeToRemove));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCustomType();
    }
  };

  const handleCancelCustom = () => {
    setCustomType("");
    setShowCustomInput(false);
    setIsAddingCustom(false);
  };

  // Handle image upload to Sanity
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    // Upload to Sanity
    const formData = new FormData();
    formData.append("file", file);
    formData.append("_type", "image");
    const res = await fetch("/api/sanity-upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (data.url) setImageUrl(data.url);
  };

  const handleFormSubmit = async (formData: FormData) => {
    try {
      // Duplicate check (frontend)
      const allToolsResult = await fetchAIToolTitlesAndURLs();
      if (allToolsResult.success) {
        const allTools = allToolsResult.data;
        const newTitle = (formData.get("title") as string)?.trim().toLowerCase();
        const newURL = (formData.get("website") as string)?.trim().toLowerCase();
        const duplicate = allTools.find((tool: any) =>
          (tool.title && tool.title.trim().toLowerCase() === newTitle) ||
          (tool.toolWebsiteURL && tool.toolWebsiteURL.trim().toLowerCase() === newURL)
        );
        if (duplicate) {
          toast({
            title: "Error",
            description: `This AI tool already exists with the same name or URL.\nTool already exists: ${duplicate.title} – ${duplicate.toolWebsiteURL}`,
            variant: "destructive",
          });
          return { error: "DUPLICATE", status: "ERROR" };
        }
      }
      console.log("Form submission started");
      
      // Get the final types array (all selected types are already the actual values)
      const finalTypes = selectedTypes.filter(Boolean);
      
      // Validate that at least one type is selected
      if (finalTypes.length === 0) {
        setErrors({ types: "Select at least one type" });
        toast({
          title: "Error",
          description: "Please select at least one type",
          variant: "destructive",
        });
        return { error: "No types selected", status: "ERROR" };
      }
      
      const formValues = {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        category: formData.get("category") as string,
        website: formData.get("website") as string,
        toolImage: imageUrl || imageUrlInput,
        pitch,
        types: finalTypes,
      };

      console.log("Form values:", formValues);

      await formSchema.parseAsync(formValues);
      console.log("Validation passed");

      if (!user) {
        console.log("User not authenticated");
        toast({ title: "Error", description: "You must be logged in to create an AI Tool." });
        return { error: "User not authenticated", status: "ERROR" };
      }

      console.log("User authenticated:", user.uid);
      
      // Create a clean user object to avoid circular references
      const cleanUser = {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
      };
      
      console.log("Calling createAiTool...");
      // Remove any previous types
      formData.delete("types");
      // Add all selected types to formData
      finalTypes.forEach((type) => formData.append("types[]", type));
      const result = await createAiTool(state, formData, pitch, cleanUser);
      console.log("createAiTool result:", result);

      if (result.status == "SUCCESS") {
        toast({
          title: "Success",
          description: "Your AI Tool submission has been created successfully and is pending admin approval",
        });

        // Create a new AI tool object for the profile update
        const newTool = {
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
          image: formValues.toolImage,
          types: finalTypes,
          toolWebsiteURL: formValues.website,
          status: "pending",
        };

        // Dispatch custom event to notify profile page of new submission
        const event = new CustomEvent('new-ai-tool-submitted', {
          detail: newTool
        });
        window.dispatchEvent(event);

        // Redirect to user's profile page with success parameter
        if (user.email) {
          router.push(`/user/${encodeURIComponent(user.email)}?newSubmission=true`);
        } else {
          router.push(`/ai-tool/${result._id}`);
        }
      } else {
        console.error("createAiTool failed:", result.error);
        toast({
          title: "Error",
          description: result.error || "Failed to create AI Tool",
          variant: "destructive",
        });
      }

      return result;
    } catch (error) {
      console.error("Form submission error:", error);
      
      if (error instanceof z.ZodError) {
        const fieldErrors = error.flatten().fieldErrors;
        console.log("Validation errors:", fieldErrors);

        // Convert field errors to a flat object
        const flatErrors: Record<string, string> = {};
        Object.entries(fieldErrors).forEach(([field, messages]) => {
          if (messages && messages.length > 0) {
            flatErrors[field] = messages[0];
          }
        });

        setErrors(flatErrors);

        toast({
          title: "Error",
          description: "Please check your inputs and try again",
          variant: "destructive",
        });

        return { error: "Validation failed", status: "ERROR" };
      }

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
          Title
        </label>
        <Input
          id="title"
          name="title"
          className="ai-tool-form_input"
          required
          placeholder="AI Tool Name"
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
          placeholder="AI Tool Description"
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
          placeholder="Enter category (e.g., Video, Text, Image, etc.)"
        />

        {errors.category && (
          <p className="ai-tool-form_error">{errors.category}</p>
        )}
      </div>

      {/* Types Selection with Custom Option */}
      <div>
        <label className="ai-tool-form_label">Types <span className="text-red-500">*</span></label>
        <div className="space-y-4 mt-3">
          {/* Available Types */}
          <div className="flex gap-4 flex-wrap">
            {availableTypes.map((type) => (
              <label key={type} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name="types[]"
                  value={type}
                  checked={selectedTypes.includes(type)}
                  onChange={() => handleTypeChange(type)}
                  className="accent-primary w-5 h-5"
                />
                <span className={`px-4 py-2 rounded-full text-sm font-bold shadow-sm border transition-all duration-200 group-hover:scale-105 ${
                  type === 'Free' 
                    ? 'bg-green-50 text-green-700 border-green-200 group-hover:bg-green-100' 
                    : type === 'Paid' 
                    ? 'bg-yellow-50 text-yellow-700 border-yellow-200 group-hover:bg-yellow-100' 
                    : type === 'Credit-Based'
                    ? 'bg-blue-50 text-blue-700 border-blue-200 group-hover:bg-blue-100'
                    : 'bg-purple-50 text-purple-700 border-purple-200 group-hover:bg-purple-100'
                }`}>
                  {type}
                </span>
              </label>
            ))}
            
            {/* Custom Type Button */}
            <button
              type="button"
              onClick={() => handleTypeChange("Custom Type")}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold shadow-sm border transition-all duration-200 hover:scale-105 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 border-purple-200 hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100"
            >
              <Plus className="w-4 h-4" />
              Custom Type
            </button>
          </div>
          
          {/* Custom Type Input */}
          {showCustomInput && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Add Custom Type:</span>
              </div>
              <div className="flex gap-2">
                <Input
                  ref={customTypeInputRef}
                  name="customType"
                  className="flex-1"
                  placeholder="Enter custom type (e.g., Freemium, Trial-Based, etc.)"
                  value={customType}
                  onChange={(e) => handleCustomTypeChange(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <Button
                  type="button"
                  onClick={handleAddCustomType}
                  disabled={!customType.trim()}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4"
                >
                  <Check className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  onClick={handleCancelCustom}
                  variant="outline"
                  className="px-4"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              {customType && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">Preview:</span>
                  <span className="px-3 py-1 rounded-full text-sm font-bold shadow-sm border bg-purple-50 text-purple-700 border-purple-200">
                    {customType}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Selected Types Display */}
          {selectedTypes.length > 0 && (
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-600 mb-3">Selected Types:</p>
              <div className="flex gap-2 flex-wrap">
                {selectedTypes.map((type, index) => (
                  <div
                    key={index}
                    className={`group relative px-3 py-1 rounded-full text-xs font-bold shadow-sm border flex items-center gap-1 ${
                      type === 'Free' 
                        ? 'bg-green-50 text-green-700 border-green-200' 
                        : type === 'Paid' 
                        ? 'bg-yellow-50 text-yellow-700 border-yellow-200' 
                        : type === 'Credit-Based'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-purple-50 text-purple-700 border-purple-200'
                    }`}
                  >
                    <span>{type}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomType(type)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-100 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3 text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        {errors.types && <p className="ai-tool-form_error">{errors.types}</p>}
        {selectedTypes.length === 0 && (
          <p className="text-orange-500 mt-2 ml-5 text-sm">Please select at least one type</p>
        )}
      </div>

      <div>
        <label htmlFor="website" className="ai-tool-form_label">
          Website URL
        </label>
        <Input
          id="website"
          name="website"
          className="ai-tool-form_input"
          required
          placeholder="AI Tool Website URL"
        />
        {errors.website && <p className="ai-tool-form_error">{errors.website}</p>}
      </div>

      <div className="my-4 p-4 bg-gray-50 rounded-lg border border-gray-200 flex flex-col items-center gap-3">
        <div className="w-full">
          <label htmlFor="toolImageUrl" className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
          <input
            id="toolImageUrl"
            name="toolImageUrl"
            type="url"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
            placeholder="https://example.com/image.png"
            value={imageUrlInput}
            onChange={e => setImageUrlInput(e.target.value)}
          />
        </div>
        {imageUrlInput && (
          <div className="flex justify-center mt-3 w-full">
            <img
              src={imageUrlInput || "/logo.png"}
              alt="Tool Preview"
              className="w-32 h-32 object-cover rounded-lg border-2 border-gray-300 shadow-sm bg-white"
              onError={e => { e.currentTarget.src = "/logo.png"; }}
            />
          </div>
        )}
        <p className="text-xs text-gray-500 mt-2 text-center">Recommended: Square image, at least 256x256px. Supported: JPG, PNG, GIF, WEBP, SVG.</p>
      </div>

      <div data-color-mode="light">
        <label htmlFor="pitch" className="ai-tool-form_label">
          Pitch
        </label>

        <MDEditor
          value={pitch}
          onChange={(value) => setPitch(value as string)}
          id="pitch"
          preview="edit"
          height={300}
          style={{ borderRadius: 20, overflow: "hidden" }}
          textareaProps={{
            placeholder:
              "Briefly describe your idea and what problem it solves",
          }}
          previewOptions={{
            disallowedElements: ["style"],
          }}
        />

        {errors.pitch && <p className="ai-tool-form_error">{errors.pitch}</p>}
      </div>

      <Button
        type="submit"
        className="ai-tool-form_btn text-white"
        disabled={isPending}
      >
        {isPending ? "Submitting..." : "Submit Your Pitch"}
        <Send className="size-6 ml-2" />
      </Button>
    </form>
  );
};

export default AiToolForm;
