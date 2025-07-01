
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Copy, 
  CheckCircle, 
  RotateCcw, 
  Download, 
  Eye,
  Code2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SpecificationViewerProps {
  specification: string;
  onReset: () => void;
}

const SpecificationViewer: React.FC<SpecificationViewerProps> = ({ 
  specification, 
  onReset 
}) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(specification);
      setCopied(true);
      toast({
        title: "복사 완료",
        description: "API 명세서가 클립보드에 복사되었습니다.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "복사 실패",
        description: "클립보드 복사 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };

  const handleDownload = () => {
    const blob = new Blob([specification], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'api-specification.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderMarkdown = (markdown: string) => {
    // 간단한 마크다운 렌더링 (프로토타입용)
    return markdown
      .split('\n')
      .map((line, index) => {
        if (line.startsWith('# ')) {
          return <h1 key={index} className="text-2xl font-bold text-white mb-4">{line.substring(2)}</h1>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={index} className="text-xl font-semibold text-blue-300 mb-3 mt-6">{line.substring(3)}</h2>;
        }
        if (line.startsWith('### ')) {
          return <h3 key={index} className="text-lg font-medium text-green-300 mb-2 mt-4">{line.substring(4)}</h3>;
        }
        if (line.startsWith('#### ')) {
          return <h4 key={index} className="text-md font-medium text-slate-300 mb-2 mt-3">{line.substring(5)}</h4>;
        }
        if (line.startsWith('```')) {
          return null; // 코드 블록 처리는 별도로
        }
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return <li key={index} className="text-slate-300 ml-4">{line.substring(2)}</li>;
        }
        if (line.trim() === '') {
          return <br key={index} />;
        }
        return <p key={index} className="text-slate-300 mb-2">{line}</p>;
      });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-green-400" />
              <div>
                <CardTitle className="text-white">API 명세서 생성 완료</CardTitle>
                <p className="text-slate-400 text-sm mt-1">자동 생성된 API 문서입니다</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
              <CheckCircle className="h-3 w-3 mr-1" />
              완료
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleCopy}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              {copied ? (
                <CheckCircle className="h-4 w-4 mr-2 text-green-400" />
              ) : (
                <Copy className="h-4 w-4 mr-2" />
              )}
              {copied ? '복사됨' : '복사하기'}
            </Button>
            <Button
              onClick={handleDownload}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <Download className="h-4 w-4 mr-2" />
              다운로드
            </Button>
            <Button
              onClick={onReset}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              다시 시작
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-0">
          <Tabs defaultValue="preview" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-700/50">
              <TabsTrigger 
                value="preview" 
                className="data-[state=active]:bg-slate-600 text-slate-300"
              >
                <Eye className="h-4 w-4 mr-2" />
                미리보기
              </TabsTrigger>
              <TabsTrigger 
                value="markdown" 
                className="data-[state=active]:bg-slate-600 text-slate-300"
              >
                <Code2 className="h-4 w-4 mr-2" />
                마크다운
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="preview" className="p-6 m-0">
              <div className="prose prose-invert max-w-none">
                {renderMarkdown(specification)}
              </div>
            </TabsContent>
            
            <TabsContent value="markdown" className="p-0 m-0">
              <div className="bg-slate-900 p-6 overflow-auto max-h-[70vh]">
                <pre className="text-slate-300 text-sm whitespace-pre-wrap font-mono">
                  {specification}
                </pre>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SpecificationViewer;
