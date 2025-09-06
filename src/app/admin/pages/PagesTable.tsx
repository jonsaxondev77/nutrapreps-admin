import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PagesClientTable from "./PagesTableClient";

export default async function PagesTable() {
  // Access the environment variable directly on the server
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3001";
  
  // You would typically fetch the data here, but since RTK Query is a client library,
  // we'll fetch it in the client component. Alternatively, if your API fetch can be
  // done on the server, you would do it here and pass the data down.

  return (
    <>
      <PageBreadcrumb pageTitle="Pages" />
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1102px]">
            {/* Pass the dynamic URL to the client component */}
            <PagesClientTable frontendUrl={frontendUrl} />
          </div>
        </div>
      </div>
    </>
  );
}