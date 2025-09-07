import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PagesClientTable from "./PagesTableClient";

export default async function PagesTable({frontEndUrl} : {frontEndUrl: string}) {

  return (
    <>
      <PageBreadcrumb pageTitle="Pages" />
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1102px]">
            {/* Pass the dynamic URL to the client component */}
            <PagesClientTable frontEndUrl={frontEndUrl} />
          </div>
        </div>
      </div>
    </>
  );
}