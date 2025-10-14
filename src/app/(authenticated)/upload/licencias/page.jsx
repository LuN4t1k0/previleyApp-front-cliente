import FileUpload from "@/components/fileUpload/FileUpload";

const UploadCertificadosPage = () => {
  return (
    <div className="pt-20">
      <FileUpload
        acceptedFileTypes={[".pdf"]}
        uploadEndpoint="https://previley-lm-python-production.up.railway.app/licencias"
        fileLimit={5}
        filePrefix="LM"
      />
    </div>
  );
};

export default UploadCertificadosPage;
