import { useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { UploadCloud01, File02 } from "@untitledui/icons";

export const FileUploader = ({ onFileSelect, accept = ".pdf,image/*", className }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    };

    const handleFileChange = (e) => {
        const files = e.target.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    };

    const handleFile = (file) => {
        setSelectedFile(file);
        if (onFileSelect) {
            onFileSelect(file);
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className={twMerge("w-full", className)}>
            <div
                role="button"
                tabIndex={0}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleClick}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleClick();
                    }
                }}
                className={twMerge(
                    "flex flex-col items-center justify-center w-full px-6 py-10 border-2 border-dashed rounded-xl cursor-pointer transition-colors",
                    isDragging
                        ? "border-brand-600 bg-brand-50"
                        : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                )}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={accept}
                    onChange={handleFileChange}
                    className="hidden"
                    aria-label="Upload file"
                />

                {selectedFile ? (
                    <div className="flex flex-col items-center gap-2">
                        <div className="p-3 bg-white rounded-full shadow-sm">
                            <File02 className="w-8 h-8 text-brand-600" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium text-gray-900">
                                {selectedFile.name}
                            </p>
                            <p className="text-xs text-gray-500">
                                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                        </div>
                        <p className="text-xs text-gray-500">
                            Cliquez pour changer de fichier
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-3">
                        <div className="p-3 bg-white rounded-full shadow-sm">
                            <UploadCloud01 className="w-8 h-8 text-gray-400" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium text-gray-900">
                                <span className="text-brand-600">Cliquez pour uploader</span> ou
                                glissez-déposez
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                PDF ou Image (MAX. 10MB)
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

