import { Suspense } from "react";
import { client } from "@/sanity/lib/client";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import View from "@/components/View";
import { ExternalLinkIcon, ArrowLeft, Globe } from "lucide-react";

// Query to fetch a single useful website by ID
const USEFUL_WEBSITE_BY_ID_QUERY = `*[_type == "usefulWebsite" && _id == $id][0] {
  _id,
  title,
  description,
  category,
  websiteURL,
  websiteImage,
  pitch,
  views,
  likes,
  _createdAt,
  author -> {
    _id,
    name,
    email,
    image
  }
}`;

const Page = async ({ params }: { params: { id: string } }) => {
  const id = params.id;

  // Fetch data from Sanity
  const website = await client.fetch(USEFUL_WEBSITE_BY_ID_QUERY, { id });

  if (!website) return notFound();

  return (
    <>
      <section className="pink_container !min-h-[230px]">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/useful-websites" className="text-white hover:text-gray-200 transition-colors flex items-center gap-2">
            <ArrowLeft className="size-5" />
            Back to Useful Websites
          </Link>
        </div>
        <p className="tag">{formatDate(website?._createdAt)}</p>
        <h1 className="heading flex items-center gap-3">
          <Globe className="size-8" />
          {website.title}
        </h1>
        <div className="flex items-center gap-3 mt-4 flex-wrap">
          <span className="bg-primary text-white px-4 py-2 rounded-full text-sm font-bold shadow-sm">
            {website.category}
          </span>
        </div>
        <p className="sub-heading !max-w-5xl mt-4">{website.description}</p>
      </section>

      <section className="section_container">
        <div className="max-w-4xl mx-auto my-8">
          {/* Why is this website useful? */}
          <div className="prose max-w-none mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Why is this website useful?</h2>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-lg">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-lg">
                {website.pitch || "No specific use case information provided."}
              </p>
            </div>
          </div>

          {/* Full Description */}
          <div className="prose max-w-none mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">About This Website</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-lg">
              {website.description}
            </p>
          </div>

          {/* Website URL */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Website URL</h3>
            <a
              href={website.websiteURL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline break-all text-lg"
            >
              {website.websiteURL}
            </a>
          </div>

          {/* Author Information */}
          {website.author && (
            <div className="mb-8 p-6 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Submitted By</h3>
              <div className="flex items-center gap-4">
                {website.author.image ? (
                  <Image
                    src={website.author.image}
                    alt={website.author.name}
                    width={64}
                    height={64}
                    className="rounded-full"
                  />
                ) : (
                  <div className="rounded-full bg-gray-300 w-16 h-16 flex items-center justify-center">
                    <span className="text-gray-600 font-semibold text-xl">
                      {website.author.name?.charAt(0) || "U"}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-900 text-lg">{website.author.name}</p>
                  <p className="text-gray-600">Website Contributor</p>
                </div>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="mb-8 p-6 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">Website Information</h3>
            <div className="grid grid-cols-2 gap-4 text-gray-700">
              <div>
                <span className="font-semibold">Category:</span> {website.category}
              </div>
              <div>
                <span className="font-semibold">Added:</span> {formatDate(website._createdAt)}
              </div>
              <div>
                <span className="font-semibold">Views:</span> {website.views || 0}
              </div>
              {/* Remove any display of likes or like count from the page */}
            </div>
          </div>
        </div>



        <div className="mt-8">
          <View id={website._id} />
        </div>
      </section>
    </>
  );
};

export default Page; 