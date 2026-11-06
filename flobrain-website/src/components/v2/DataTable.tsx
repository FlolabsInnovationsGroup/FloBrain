import Link from "next/link";
import type { ReactNode } from "react";

type DataTableProps = {
  title: string;
  headings: string[];
  children: ReactNode;
  viewAllHref?: string;
  viewAllLabel?: string;
};

export default function DataTable({
  title,
  headings,
  children,
  viewAllHref,
  viewAllLabel,
}: DataTableProps) {
  return (
    <section className="fb-v2-table-section">
      <div className="fb-v2-section-heading">
        <h2 className="fb-v2-section-title">{title}</h2>
        {viewAllHref && (
          <Link href={viewAllHref} aria-label={viewAllLabel} className="fb-v2-view-all">
            VIEW ALL
          </Link>
        )}
      </div>
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
