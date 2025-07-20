import React from "react";
import { fetchUsefulWebsitesByAuthor } from "@/lib/sanity-client";
import UsefulWebsiteCard, { UsefulWebsiteTypeCard } from "@/components/UsefulWebsiteCard";

const UserUsefulWebsites = async ({ id, status }: { id: string; status?: string }) => {
  const result = await fetchUsefulWebsitesByAuthor(id);
  const websites = result.success ? result.data : [];
  
  // Filter by status if provided
  const filteredWebsites = status 
    ? websites.filter((site: UsefulWebsiteTypeCard) => site.status === status)
    : websites;

  return (
    <>
      {filteredWebsites.length > 0 ? (
        filteredWebsites.map((site: UsefulWebsiteTypeCard) => (
          <UsefulWebsiteCard key={site._id} post={site} />
        ))
      ) : (
        <p className="text-gray-500 text-center py-4">
          {status === "pending" ? "No pending Useful Websites found." : 
           status === "approved" ? "No approved Useful Websites found." : 
           "No Useful Websites found."}
        </p>
      )}
    </>
  );
};

export default UserUsefulWebsites;
