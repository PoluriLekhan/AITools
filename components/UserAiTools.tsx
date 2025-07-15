import React from "react";
import { fetchAIToolsByAuthor } from "@/lib/sanity-client";
import AiToolCard, { AiToolTypeCard } from "@/components/AiToolCard";

const UserAiTools = async ({ id, status }: { id: string; status?: string }) => {
  const result = await fetchAIToolsByAuthor(id);
  const aiTools = result.success ? result.data : [];
  
  // Filter by status if provided
  const filteredTools = status 
    ? aiTools.filter((tool: AiToolTypeCard) => tool.status === status)
    : aiTools;

  return (
    <>
      {filteredTools.length > 0 ? (
        filteredTools.map((aiTool: AiToolTypeCard) => (
          <AiToolCard key={aiTool._id} post={aiTool} />
        ))
      ) : (
        <p className="text-gray-500 text-center py-4">
          {status === "pending" ? "No pending AI Tools found." : 
           status === "approved" ? "No approved AI Tools found." : 
           "No AI Tools found."}
        </p>
      )}
    </>
  );
};

export default UserAiTools;
