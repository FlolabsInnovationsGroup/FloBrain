import type { ReactNode } from "react";

type DataTableProps = {
  title: string;
  headings: string[];
  children: ReactNode;
};

export default function DataTable({ title, headings, children }: DataTableProps) {
  return (
    <section className="fb-v2-table-section">
      <h2 className="fb-v2-section-title">{title}</h2>
      <div
        className="fb-v2-table-scroll"
        role="region"
        aria-label={`${title} table, scroll horizontally on small screens`}
        tabIndex={0}
      >
        <table className="fb-v2-table">
          <caption className="sr-only">{title}</caption>
          <thead>
            <tr>
              {headings.map((heading) => (
                <th key={heading} scope="col">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </section>
  );
}
