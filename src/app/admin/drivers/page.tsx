import PageBreadCrumb from '@/components/common/PageBreadCrumb';
import DriversTable from './DriversTable';

const DriversPage = () => {
  return (
    <>
      <PageBreadCrumb pageTitle="Drivers" />
      <DriversTable />
    </>
  );
};

export default DriversPage;