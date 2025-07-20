"use client";

import * as Sentry from "@sentry/nextjs";
import NextError from "next/error";
import { useEffect } from "react";

function isChunkLoadError(error: any) {
  return error && error.name === "ChunkLoadError";
}

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  if (isChunkLoadError(error)) {
    return (
      <html>
        <body>
          <h1>Oops! A required part of the app failed to load.</h1>
          <p>This is usually caused by a new deployment. Please refresh the page.</p>
        </body>
      </html>
    );
  }

  return (
    <html>
      <body>
        {/* `NextError` is the default Next.js error page component. Its type
        definition requires a `statusCode` prop. However, since the App Router
        does not expose status codes for errors, we simply pass 0 to render a
        generic error message. */}
        <NextError statusCode={0} />
      </body>
    </html>
  );
}