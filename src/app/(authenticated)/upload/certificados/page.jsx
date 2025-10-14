import FileUpload from "@/components/fileUpload/FileUpload";

const UploadCertificadosPage = () => {
  return (
    <div className="pt-30">
      <FileUpload
        acceptedFileTypes={[".pdf"]}
        uploadEndpoint="https://previley-lm-python-production.up.railway.app/certificados"
        fileLimit={5}
        filePrefix="CD"
      />
    </div>
  );
};

export default UploadCertificadosPage;
