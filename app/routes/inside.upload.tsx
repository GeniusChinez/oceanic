/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable jsx-a11y/label-has-associated-control */
import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { useRef } from "react";

import { prisma } from "~/db.server";
import { mongo } from "~/db2.server";
import { parseCsvAsync } from "~/models/csv.server";
import { requireUser } from "~/session.server";
import { getBoundingBoxFromRows } from "~/utils/geo";

export async function loader({ request }: LoaderFunctionArgs) {
  console.log("FIRST");
  const user = await requireUser(request);
  console.log("SECOND");
  const elements = await prisma.element.findMany({
    select: { id: true, name: true }
  });
  console.log("THIRD");
  return json({ user, elements });
}

export async function action({ request }: ActionFunctionArgs) {
  console.log("FOURTH")
  const user = await requireUser(request);
  const formData = await request.formData();
  const file = formData.get("file") as File;
  const elementId = parseInt(formData.get("elementId") as string);

  if (!file || !elementId) {
    return json({ error: "Missing file or element ID" }, { status: 400 });
  }

  const csvText = await file.text();
  const records = await parseCsvAsync(csvText, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });

  const dataPoints = records.map((row: any) => ({
    elementId,
    fileId: "placeholder", // to be set after MySQL insert
    latitude: parseFloat(row.latitude),
    longitude: parseFloat(row.longitude),
    value: parseFloat(row.value)
  }));

  const { latMin, latMax, longMin, longMax } = getBoundingBoxFromRows(dataPoints);

  const fileMeta = await prisma.file.create({
    data: {
      userId: user.id,
      uploadTime: new Date(),
      lattMin: latMin,
      lattMax: latMax,
      longMin,
      longMax
    }
  });

  await mongo.elementData.createMany({
    data: dataPoints.map((d) => ({ ...d, fileId: fileMeta.id, timestamp: new Date() }))
  });

  return json({ success: true, count: dataPoints.length });
}

export default function Upload() {
  const { elements } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Upload Marine Data (CSV)</h1>

      {actionData && "error" in actionData ? <p className="text-red-600 font-semibold">{actionData.error}</p> : null}
      {actionData && "success" in actionData ? <p className="text-green-600 font-semibold">
          Upload successful! {actionData.count} records saved.
        </p> : null}

      <Form method="post" encType="multipart/form-data" ref={formRef} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Element</label>
          <select name="elementId" className="w-full rounded border px-3 py-2">
            <option value="">-- Select an Element --</option>
            {elements.map((e) => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">CSV File</label>
          <input type="file" name="file" accept=".csv" className="w-full" required />
        </div>

        <button
          type="submit"
          className="rounded bg-blue-600 text-white px-4 py-2 hover:bg-blue-700"
        >
          Upload
        </button>
      </Form>
    </div>
  );
}
