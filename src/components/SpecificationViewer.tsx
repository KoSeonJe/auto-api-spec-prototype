
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
    const lines = markdown.split('\n');
    const elements: JSX.Element[] = [];
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];
    let codeBlockLanguage = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // 코드 블록 처리
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          // 코드 블록 종료
          elements.push(
            <div key={i} className="my-4 rounded-lg overflow-hidden border border-slate-600">
              {codeBlockLanguage && (
                <div className="bg-slate-700 px-4 py-2 text-xs text-slate-300 font-mono border-b border-slate-600">
                  {codeBlockLanguage}
                </div>
              )}
              <pre className="bg-slate-800 p-4 overflow-x-auto">
                <code className="text-sm text-slate-200 font-mono leading-relaxed">
                  {codeBlockContent.join('\n')}
                </code>
              </pre>
            </div>
          );
          inCodeBlock = false;
          codeBlockContent = [];
          codeBlockLanguage = '';
        } else {
          // 코드 블록 시작
          inCodeBlock = true;
          codeBlockLanguage = line.substring(3).trim();
        }
        continue;
      }

      if (inCodeBlock) {
        codeBlockContent.push(line);
        continue;
      }

      // 제목 처리
      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={i} className="text-3xl font-bold text-white mb-6 mt-8 pb-3 border-b border-slate-600">
            {line.substring(2)}
          </h1>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={i} className="text-2xl font-semibold text-slate-100 mb-4 mt-8">
            {line.substring(3)}
          </h2>
        );
      } else if (line.startsWith('### ')) {
        elements.push(
          <h3 key={i} className="text-xl font-medium text-slate-200 mb-3 mt-6">
            {line.substring(4)}
          </h3>
        );
      } else if (line.startsWith('#### ')) {
        elements.push(
          <h4 key={i} className="text-lg font-medium text-slate-300 mb-2 mt-4">
            {line.substring(5)}
          </h4>
        );
      }
      // 굵은 텍스트 처리
      else if (line.includes('**')) {
        const parts = line.split('**');
        const processedLine = parts.map((part, index) => 
          index % 2 === 1 ? 
            <strong key={index} className="font-semibold text-blue-300">{part}</strong> : 
            part
        );
        elements.push(
          <p key={i} className="text-slate-300 mb-3 leading-relaxed">
            {processedLine}
          </p>
        );
      }
      // 인라인 코드 처리
      else if (line.includes('`') && !line.startsWith('```')) {
        const parts = line.split('`');
        const processedLine = parts.map((part, index) => 
          index % 2 === 1 ? 
            <code key={index} className="bg-slate-700 text-blue-300 px-2 py-1 rounded text-sm font-mono">
              {part}
            </code> : 
            part
        );
        elements.push(
          <p key={i} className="text-slate-300 mb-3 leading-relaxed">
            {processedLine}
          </p>
        );
      }
      // 리스트 처리
      else if (line.startsWith('- ') || line.startsWith('* ')) {
        elements.push(
          <div key={i} className="flex items-start mb-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
            <p className="text-slate-300 leading-relaxed">{line.substring(2)}</p>
          </div>
        );
      }
      // 구분선 처리
      else if (line.trim() === '---') {
        elements.push(
          <hr key={i} className="border-slate-600 my-8" />
        );
      }
      // 빈 줄 처리
      else if (line.trim() === '') {
        elements.push(<div key={i} className="h-2" />);
      }
      // 일반 텍스트 처리
      else if (line.trim() !== '') {
        elements.push(
          <p key={i} className="text-slate-300 mb-3 leading-relaxed">
            {line}
          </p>
        );
      }
    }

    return elements;
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
            
            <TabsContent value="preview" className="p-0 m-0">
              <div className="bg-white/95 min-h-[60vh] max-h-[80vh] overflow-auto">
                <div className="max-w-4xl mx-auto px-12 py-10">
                  <div className="space-y-1">
                    {renderMarkdown(specification)}
                  </div>
                </div>
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
