import { NextRequest, NextResponse } from "next/server";
import { writeClient } from "@/sanity/lib/write-client";
import { client } from "@/sanity/lib/client";

export function GET() {
  return Response.json({ error: "Method Not Allowed" }, { status: 405 });
}

export function PUT() {
  return Response.json({ error: "Method Not Allowed" }, { status: 405 });
}

export function DELETE() {
  return Response.json({ error: "Method Not Allowed" }, { status: 405 });
}

export function PATCH() {
  return Response.json({ error: "Method Not Allowed" }, { status: 405 });
}

export async function POST(request: NextRequest) {
  try {
    const { 
      toolId, 
      action, 
      documentType,
      updates,
      status,
      views, 
      likes, 
      autoIncrementViews, 
      autoIncrementLikes,
      adminEmail 
    } = await request.json();
    
    if (!toolId || !action || !adminEmail) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    // Verify admin status
    const adminUser = await client.fetch(
      `*[_type == "author" && email == $email && isAdmin == true][0]`,
      { email: adminEmail }
    );

    if (!adminUser) {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 401 });
    }

    let updateData: any = {};

        switch (action) {
      case "update":
        if (documentType === "usefulWebsite") {
          updateData = updates;
        }
        break;

      case "updateStatus":
        updateData = { status: status };
        break;

      case "delete":
        // Handle deletion
        if (documentType === "usefulWebsite") {
          await writeClient.delete(toolId);
        } else {
          await writeClient.delete(toolId);
        }
        return NextResponse.json({ 
          success: true, 
          message: `${documentType === "usefulWebsite" ? "Useful Website" : "Tool"} deleted successfully`
        });
      
      case "setViews":
        if (typeof views !== 'number' || views < 0) {
          return NextResponse.json({ error: "Views must be a non-negative number" }, { status: 400 });
        }
        updateData = { views };
        break;

      case "setLikes":
        if (typeof likes !== 'number' || likes < 0) {
          return NextResponse.json({ error: "Likes must be a non-negative number" }, { status: 400 });
        }
        updateData = { likes };
        break;

      case "setAutoIncrement":
        updateData = {
          autoIncrementViews: autoIncrementViews,
          autoIncrementLikes: autoIncrementLikes
        };
        break;

      case "incrementViews":
        const currentTool = await client.fetch(
          `*[_type == "aiTool" && _id == $id][0]{views}`,
          { id: toolId }
        );
        updateData = { views: (currentTool?.views || 0) + 1 };
        break;

      case "incrementLikes":
        const currentToolLikes = await client.fetch(
          `*[_type == "aiTool" && _id == $id][0]{likes}`,
          { id: toolId }
        );
        updateData = { likes: (currentToolLikes?.likes || 0) + 1 };
        break;

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Update the document based on type
    let updatedDocument;
    try {
      if (documentType === "usefulWebsite") {
        updatedDocument = await writeClient
          .patch(toolId)
          .set(updateData)
          .commit();
      } else {
        // Default to AI Tool
        updatedDocument = await writeClient
          .patch(toolId)
          .set(updateData)
          .commit();
      }

      console.log(`Successfully updated ${documentType} with ID ${toolId}:`, updateData);
      
      return NextResponse.json({ 
        success: true, 
        document: updatedDocument,
        message: `${documentType === "usefulWebsite" ? "Useful Website" : "Tool"} ${action} updated successfully`
      });
    } catch (updateError) {
      console.error(`Error updating ${documentType} with ID ${toolId}:`, updateError);
      return NextResponse.json({ 
        success: false, 
        error: `Failed to update ${documentType}`,
        details: updateError instanceof Error ? updateError.message : 'Unknown error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error("Error managing tool:", error);
    return NextResponse.json({ error: "Failed to manage tool" }, { status: 500 });
  }
} 