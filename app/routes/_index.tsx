import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";

import { useOptionalUser } from "~/utils";

export const meta: MetaFunction = () => [
  { title: "Marine Data Hub" },
  { name: "description", content: "Spatio-temporal marine data system for climate research and decision-making." }
];

export default function Index() {
  const user = useOptionalUser();

  return (
    <>
      <header className="bg-blue-600 text-white flex items-center justify-between px-6 py-3 z-50 shadow-md">
        <div className="container mx-auto flex items-center justify-between">
          <div>
            <div className="text-xl font-bold">Marine Data Hub</div>
            <p className="text-base opacity-75">Monitor, query, and analyze spatio-temporal marine data.</p>
          </div>

          {user ? (
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="font-semibold">{user.fullName ?? "Unknown"}</div>
                <div className="text-sm opacity-75">{user.email}</div>
              </div>
              <form method="post" action="/logout">
                <button
                  type="submit"
                  className="rounded bg-blue-400 px-3 py-3 text-sm font-medium hover:bg-blue-500 transition"
                >
                  Logout
                </button>
              </form>
            </div>
          ) : (
            <div className="space-x-4">
              <Link
                to="/login"
                className="hover:underline text-sm font-medium"
              >
                Log In
              </Link>
              <Link
                to="/join"
                className="hover:underline text-sm font-medium"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </header>

      <main className="relative min-h-screen bg-white sm:flex sm:items-center sm:justify-center">
        <div className="relative sm:pb-16 sm:pt-8">
          <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="relative shadow-xl sm:overflow-hidden sm:rounded-2xl">
              <div className="absolute inset-0">
                <img
                  className="h-full w-full object-cover"
                  src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e"
                  alt="Ocean waves"
                />
                <div className="absolute inset-0 bg-[color:rgba(0,98,168,0.55)] mix-blend-multiply" />
              </div>
              <div className="relative px-4 pb-8 pt-16 sm:px-6 sm:pb-14 sm:pt-24 lg:px-8 lg:pb-20 lg:pt-32">
                <h1 className="text-center text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
                  <span className="block uppercase text-white drop-shadow-md">
                    Marine Data Hub
                  </span>
                </h1>
                <p className="mx-auto mt-6 max-w-2xl text-center text-xl text-white">
                  Monitor, query, and analyze spatio-temporal marine data — empowering ocean research, disaster preparedness, and business insights through a hybrid MySQL, MongoDB, and Redis architecture.
                </p>
                <div className="mx-auto mt-10 max-w-sm sm:flex sm:max-w-none sm:justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                  {user ? (
                    <>
                      <Link
                        to="/inside"
                        className="flex items-center justify-center rounded-md bg-white px-6 py-3 text-base font-medium text-blue-700 shadow-sm hover:bg-blue-50"
                      >
                        Explore Data
                      </Link>
                      <Link
                        to="/inside/upload"
                        className="flex items-center justify-center rounded-md bg-blue-500 px-6 py-3 text-base font-medium text-white hover:bg-blue-600"
                      >
                        Upload New Data
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/join"
                        className="flex items-center justify-center rounded-md bg-white px-6 py-3 text-base font-medium text-blue-700 shadow-sm hover:bg-blue-50"
                      >
                        Sign Up
                      </Link>
                      <Link
                        to="/login"
                        className="flex items-center justify-center rounded-md bg-blue-600 px-6 py-3 text-base font-medium text-white hover:bg-blue-700"
                      >
                        Log In
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tech Stack */}
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="mt-6 flex flex-wrap justify-center gap-8">
              {[
                {
                  src: "https://www.mysql.com/common/logos/logo-mysql-170x115.png",
                  alt: "MySQL",
                  href: "https://www.mysql.com/",
                },
                {
                  src: "https://webimages.mongodb.com/_com_assets/cms/kusbgztbbnnh146q8-MongoDBLogo1.png?auto=format%252Ccompress",
                  alt: "MongoDB",
                  href: "https://www.mongodb.com/",
                },
                {
                  src: "https://redis.io/wp-content/uploads/2024/04/Logotype.svg?auto=webp&quality=85,75&width=120",
                  alt: "Redis",
                  href: "https://redis.io/",
                },
                {
                  src: "https://upload.wikimedia.org/wikipedia/commons/d/d5/Tailwind_CSS_Logo.svg",
                  alt: "Tailwind CSS",
                  href: "https://tailwindcss.com/",
                },
                {
                  src: "https://remix.run/_brand/remix-light.png",
                  alt: "Remix",
                  href: "https://remix.run/",
                },
              ].map((img) => (
                <a
                  key={img.href}
                  href={img.href}
                  className="flex h-16 w-32 justify-center p-2 grayscale transition hover:grayscale-0 focus:grayscale-0"
                >
                  <img alt={img.alt} src={img.src} className="object-contain" />
                </a>
              ))}

            </div>
          </div>
        </div>
      </main>
    </>
  );
}
