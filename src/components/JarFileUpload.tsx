
import React, { useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileArchive, AlertCircle } from 'lucide-react';

interface JarFileUploadProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
}

const JarFileUpload: React.FC<JarFileUploadProps> = ({ onFileSelect, selectedFile }) => {
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // JAR 파일 또는 ZIP 파일만 허용
      if (file.name.endsWith('.jar') || file.name.endsWith('.zip')) {
        onFileSelect(file);
      } else {
        alert('JAR 또는 ZIP 파일만 업로드할 수 있습니다.');
      }
    }
  }, [onFileSelect]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file && (file.name.endsWith('.jar') || file.name.endsWith('.zip'))) {
      onFileSelect(file);
    } else {
      alert('JAR 또는 ZIP 파일만 업로드할 수 있습니다.');
    }
  }, [onFileSelect]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          JAR 파일 업로드
        </label>
        <Card 
          className="bg-slate-700/50 border-slate-600 border-dashed border-2 hover:border-blue-500 transition-colors cursor-pointer"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <CardContent className="p-8 text-center">
            <input
              type="file"
              accept=".jar,.zip"
              onChange={handleFileSelect}
              className="hidden"
              id="jar-upload"
            />
            <label htmlFor="jar-upload" className="cursor-pointer">
              <div className="flex flex-col items-center space-y-4">
                {selectedFile ? (
                  <>
                    <FileArchive className="h-12 w-12 text-green-400" />
                    <div>
                      <p className="text-green-400 font-medium">{selectedFile.name}</p>
                      <p className="text-slate-400 text-sm">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <Upload className="h-12 w-12 text-slate-400" />
                    <div>
                      <p className="text-slate-300 font-medium">
                        JAR 파일을 드래그하거나 클릭하여 업로드
                      </p>
                      <p className="text-slate-400 text-sm">
                        Spring Boot JAR 또는 ZIP 파일 (최대 100MB)
                      </p>
                    </div>
                  </>
                )}
              </div>
            </label>
          </CardContent>
        </Card>
      </div>
      
      <div className="bg-blue-900/20 border border-blue-800/50 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5" />
          <div className="text-sm text-blue-300">
            <p className="font-medium mb-1">JAR 파일 분석 안내</p>
            <ul className="list-disc list-inside space-y-1 text-blue-200">
              <li>Spring Boot JAR 파일의 소스코드를 분석합니다</li>
              <li>Controller 클래스들을 찾아 API 엔드포인트를 추출합니다</li>
              <li>파일 크기가 클 경우 분석에 시간이 걸릴 수 있습니다</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JarFileUpload;
