import { parse , Options } from "csv-parse";

export function parseCsvAsync(input: string, options?: Options): Promise<unknown[]> {
  return new Promise((resolve, reject) => {
    parse(
      input,
      {
        ...options,
        columns: true,
        trim: true,
        skip_empty_lines: true,
      },
      (err, output) => {
        if (err) return reject(err);
        resolve(output);
      }
    );
  });
}