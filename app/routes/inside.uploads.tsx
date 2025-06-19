/* eslint-disable react/jsx-no-leaked-render */
import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import dayjs from "dayjs";
import { useState } from "react";
import { FaDownload, FaEye } from "react-icons/fa";

import { prisma } from "~/db.server";
import { mongo } from "~/db2.server";
import { requireUser } from "~/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);

  const files = await prisma.file.findMany({
    where: { userId: user.id },
    orderBy: { uploadTime: "desc" },
  });

  const enrichedFiles = await Promise.all(
    files.map(async (file) => {
      const records = await mongo.elementData.findMany({
        where: { fileId: file.id },
        take: 10,
      });

      const enrichedRecords = await Promise.all(
        records.map(async (r) => {
          const element = await prisma.element.findUnique({
            where: { id: r.elementId },
            include: { category: true },
          });

          return {
            ...r,
            elementName: element?.name ?? "Unknown",
            elementCategory: element?.category?.name ?? "Uncategorized",
          };
        })
      );

      return {
        ...file,
        sampleData: enrichedRecords,
      };
    })
  );

  return json({ files: enrichedFiles });
}

export default function Uploads() {
  const { files } = useLoaderData<typeof loader>();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">My Uploads</h1>

      {files.length === 0 ? (
        <div className="rounded bg-blue-50 px-6 py-4 text-gray-600 italic border border-blue-200">
          You haven’t uploaded any files yet.
        </div>
      ) : (
        <div className="space-y-4">
          {files.map((file) => (
            <div
              key={file.id}
              className="border rounded-xl bg-white shadow-sm overflow-hidden"
            >
              {/* Header Row */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center px-6 py-4 gap-4">
                <div className="space-y-1">
                  <div className="text-lg font-medium text-gray-800">
                    File #{file.id}
                  </div>
                  <div className="text-sm text-gray-500">
                    Uploaded on{" "}
                    <span className="font-semibold">
                      {dayjs(file.uploadTime).format("DD MMM YYYY, HH:mm A")}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    <span className="font-medium text-gray-600">Lat:</span>{" "}
                    {file.lattMin} → {file.lattMax},{" "}
                    <span className="font-medium text-gray-600">Long:</span>{" "}
                    {file.longMin} → {file.longMax}
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-3 self-end">
                  <button
                    onClick={() =>
                      setExpandedId(expandedId === file.id ? null : file.id)
                    }
                    className="inline-flex items-center gap-1 rounded border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
                  >
                    <FaEye className="w-4 h-4" />
                    {expandedId === file.id ? "Hide Preview" : "Preview Top 10"}
                  </button>

                  <form method="get" action={`/api/download/${file.id}`}>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1 rounded bg-blue-600 text-white px-3 py-1.5 text-sm hover:bg-blue-700 transition"
                    >
                      <FaDownload className="w-4 h-4" />
                      Download
                    </button>
                  </form>
                </div>
              </div>

              {/* Expandable Preview Table */}
              {expandedId === file.id && (
                <div className="overflow-x-auto px-6 pb-6">
                  <table className="w-full text-sm border-t border-gray-200 mt-2">
                    <thead className="bg-gray-100 text-gray-700">
                      <tr>
                        <th className="px-4 py-2 text-left">Latitude</th>
                        <th className="px-4 py-2 text-left">Longitude</th>
                        <th className="px-4 py-2 text-left">Value</th>
                        <th className="px-4 py-2 text-left">Element</th>
                        <th className="px-4 py-2 text-left">Category</th>
                        <th className="px-4 py-2 text-left">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {file.sampleData.map((d, i) => (
                        <tr
                          key={i}
                          className="hover:bg-blue-50 transition"
                        >
                          <td className="px-4 py-2">{d.latitude}</td>
                          <td className="px-4 py-2">{d.longitude}</td>
                          <td className="px-4 py-2">{d.value}</td>
                          <td className="px-4 py-2">{d.elementName}</td>
                          <td className="px-4 py-2">{d.elementCategory}</td>
                          <td className="px-4 py-2">
                            {dayjs(d.timestamp).format("DD MMM YYYY, HH:mm")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
