import BlogCreateForm from "@/components/BlogCreateForm";

export default function BlogCreatePage() {
  return (
    <>
      <section className="pink_container">
        <h1 className="heading gradient-text">
          Create New Blog Post
        </h1>
        <p className="sub-heading">
          Share your insights and knowledge with the community
        </p>
      </section>

      <section className="section_container mt-8">
        <BlogCreateForm />
      </section>
    </>
  );
} 