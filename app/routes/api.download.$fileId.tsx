import { LoaderFunctionArgs } from "@remix-run/node";

import { mongo } from "~/db2.server";

export async function loader({ params }: LoaderFunctionArgs) {
  const fileId = params.fileId ? parseInt(params.fileId) : null;
  if (!fileId || isNaN(fileId)) throw new Response("Missing fileId", { status: 400 });

  const records = await mongo.elementData.findMany({ where: { fileId } });

  const csvHeader = "latitude,longitude,value,elementId,timestamp\n";
  const csvBody = records
    .map((r) =>
      [r.latitude, r.longitude, r.value, r.elementId, r.timestamp.toISOString()].join(",")
    )
    .join("\n");

  return new Response(csvHeader + csvBody, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="file_${fileId}.csv"`,
    },
  });
}
