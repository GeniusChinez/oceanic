/* eslint-disable jsx-a11y/label-has-associated-control */
import { type LoaderFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData, useSearchParams } from "@remix-run/react";
import dayjs from "dayjs";

import { prisma } from "~/db.server";
import { getElementDataByBoundingBox } from "~/models/marine.server";

function parseParamToNumber(param: string | null): number | undefined {
  if (param === null) return undefined;
  const num = parseFloat(param);
  return isNaN(num) ? undefined : num;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const latMin = parseParamToNumber(url.searchParams.get("latMin"));
  const latMax = parseParamToNumber(url.searchParams.get("latMax"));
  const longMin = parseParamToNumber(url.searchParams.get("longMin"));
  const longMax = parseParamToNumber(url.searchParams.get("longMax"));
  const elementId = url.searchParams.get("elementId")
    ? parseInt(url.searchParams.get("elementId")!)
    : undefined;

  const elements = await prisma.element.findMany({
    select: {
      id: true,
      name: true
    },
  });

  const data = await getElementDataByBoundingBox({ latMin, latMax, longMin, longMax, elementId });

  return { elements, data: data.map((d) => ({ ...d, elementName: elements.find((e) => e.id === d.elementId)?.name })) };
}

export default function DataInside() {
  const { elements, data } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">View & Query Data</h1>

      <Form
  method="get"
  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 bg-white p-6 rounded-xl shadow-md border border-gray-200"
>
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1">Latitude Min</label>
    <input
      name="latMin"
      defaultValue={searchParams.get("latMin") || ""}
      type="number"
      step="any"
      placeholder="e.g. -10.123"
      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
    />
  </div>
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1">Latitude Max</label>
    <input
      name="latMax"
      defaultValue={searchParams.get("latMax") || ""}
      type="number"
      step="any"
      placeholder="e.g. 20.456"
      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
    />
  </div>
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1">Longitude Min</label>
    <input
      name="longMin"
      defaultValue={searchParams.get("longMin") || ""}
      type="number"
      step="any"
      placeholder="e.g. 30.789"
      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
    />
  </div>
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1">Longitude Max</label>
    <input
      name="longMax"
      defaultValue={searchParams.get("longMax") || ""}
      type="number"
      step="any"
      placeholder="e.g. 50.000"
      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
    />
  </div>
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1">Element (optional)</label>
    <select
      name="elementId"
      defaultValue={searchParams.get("elementId") || ""}
      className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
    >
      <option value="">All Elements</option>
      {elements.map((e) => (
        <option key={e.id} value={e.id}>{e.name}</option>
      ))}
    </select>
  </div>
  <div className="flex items-end justify-start md:justify-end">
    <button
      type="submit"
      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      Filter
    </button>
  </div>
</Form>


      {data.length > 0 ? (
  <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
    <table className="min-w-full text-sm text-gray-700">
      <thead className="bg-blue-200 text-black font-extrabold text-xs uppercase tracking-wide">
        <tr>
          <th className="px-6 py-4 text-left font-semibold">Element Name</th>
          <th className="px-6 py-4 text-left font-semibold">Latitude</th>
          <th className="px-6 py-4 text-left font-semibold">Longitude</th>
          <th className="px-6 py-4 text-left font-semibold">Value</th>
          <th className="px-6 py-4 text-left font-semibold">Timestamp</th>
          <th className="px-6 py-4 text-left font-semibold">User</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 bg-white">
        {data.map((row, i) => (
          <tr
            key={i}
            className="hover:bg-blue-50 transition-colors duration-200"
          >
            <td className="px-6 py-4 whitespace-nowrap">{row.elementName}</td>
            <td className="px-6 py-4 whitespace-nowrap">{row.latitude}</td>
            <td className="px-6 py-4 whitespace-nowrap">{row.longitude}</td>
            <td className="px-6 py-4 whitespace-nowrap">{row.value}</td>
            <td className="px-6 py-4 whitespace-nowrap">{dayjs(row.timestamp).format("ddd DD MMM YYYY, HH:mm:ss A")}</td>
            <td className="px-6 py-4 whitespace-nowrap">{row.user?.fullName || "---"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
) : (
  <p className="text-gray-500 italic">No data found. Try entering coordinates and filtering.</p>
)}
    </div>
  );
}
