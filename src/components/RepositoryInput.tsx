
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Github, ExternalLink, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface RepositoryInputProps {
  value: string;
  onChange: (value: string) => void;
}

const RepositoryInput: React.FC<RepositoryInputProps> = ({ value, onChange }) => {
  const [isValidUrl, setIsValidUrl] = useState(true);

  const validateGithubUrl = (url: string) => {
    if (!url) {
      setIsValidUrl(true);
      return;
    }
    
    const githubUrlPattern = /^https:\/\/github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+\/?$/;
    const isValid = githubUrlPattern.test(url);
    setIsValidUrl(isValid);
    
    if (isValid) {
      onChange(url);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="repository-url" className="text-slate-300 flex items-center gap-2">
          <Github className="h-4 w-4" />
          GitHub Repository URL
        </Label>
        <Input
          id="repository-url"
          type="url"
          placeholder="https://github.com/username/repository"
          value={value}
          onChange={(e) => validateGithubUrl(e.target.value)}
          className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500"
        />
        {!isValidUrl && (
          <Alert className="bg-red-900/20 border-red-800 text-red-300">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              올바른 GitHub Repository URL을 입력해주세요.
            </AlertDescription>
          </Alert>
        )}
      </div>
      
      <Card className="bg-slate-700/30 border-slate-600">
        <CardContent className="pt-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <ExternalLink className="h-3 w-3" />
              지원되는 Repository
            </h4>
            <ul className="text-sm text-slate-400 space-y-1">
              <li>• Public Repository만 지원됩니다</li>
              <li>• Java/Spring Boot 프로젝트 최적화</li>
              <li>• Controller 및 REST API 구조 자동 감지</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RepositoryInput;
