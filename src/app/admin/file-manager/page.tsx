import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { FileManager } from "@/components/file-manager/FileManager";

const FileManagerPage = () => {
    return (
        <>
            <PageBreadCrumb pageTitle="Image Manager" />
            <FileManager />
        </>
    );
};

export default FileManagerPage;