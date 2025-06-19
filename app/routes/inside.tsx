import { LoaderFunctionArgs } from "@remix-run/node";
import { Outlet, useLoaderData, useLocation } from "@remix-run/react";
import { FaSearch, FaFolder, FaUpload } from "react-icons/fa";


import { Tabs2 } from "~/components/Tabs";
import { requireUser } from "~/session.server"

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  return {
    user: {
      ...user,
      password: null,
    }
  }
}

export default function Inside() {
  const { user } = useLoaderData<typeof loader>();
  const { pathname } = useLocation();

  return (
    <>
      <header className="bg-blue-600 text-white flex items-center justify-between px-6 py-3 z-50 shadow-md">
        <div className="container mx-auto flex items-center justify-between">
          <div>
            <div className="text-xl font-bold">Marine Data Hub</div>
            <p className="text-base opacity-75">Monitor, query, and analyze spatio-temporal marine data.</p>
          </div>

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
        </div>
      </header>
      <main className="container mx-auto flex flex-col gap-4 mt-5 pb-20">
        <Tabs2
          tabs={[
            {
              label: "View & Query Data",
              href: "/inside",
              isActive: () => pathname === "/inside",
              Icon: FaSearch,
            },
            {
              label: "My Uploads",
              href: "/inside/uploads",
              isActive: () => pathname === "/inside/uploads",
              Icon: FaFolder,
            },
            {
              label: "Upload New Data",
              href: "/inside/upload",
              isActive: () => pathname === "/inside/upload",
              Icon: FaUpload,
            },
          ]}
        />

        <Outlet />
      </main>
    </>
  )
}