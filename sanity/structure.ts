import type { StructureResolver } from "sanity/structure";

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.documentTypeListItem("author").title("Authors"),
      S.documentTypeListItem("aiTool").title("AI Tools"),
      S.listItem()
        .title("Pending Blogs")
        .child(
          S.documentList()
            .title("Pending Blogs")
            .filter('_type == "blog" && status == "pending"')
        ),
      S.documentTypeListItem("blog").title("All Blogs"),
    ]);
