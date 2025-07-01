
import { AnalysisResult } from '@/types/api';
import { extractJavaFilesFromJar } from './jarProcessor';
import { callGeminiAPI, callOpenAIAPI } from './aiClients';
import { generateAnalysisPrompt } from './promptGenerator';

// JAR 파일 분석 함수
export const analyzeJarFile = async (
  jarFile: File,
  aiModel: 'gemini' | 'openai',
  apiKey: string,
  onProgress?: (step: string, description: string) => void
): Promise<AnalysisResult> => {
  
  console.log('Starting JAR file analysis:', jarFile.name);
  
  try {
    // 1단계: JAR 파일에서 Java 파일들 추출
    onProgress?.('extract', 'JAR 파일에서 Java Controller 파일들을 추출하는 중...');
    const javaFiles = await extractJavaFilesFromJar(jarFile);
    
    if (javaFiles.length === 0) {
      throw new Error('JAR 파일에서 Java Controller 파일을 찾을 수 없습니다. Spring Boot 프로젝트인지 확인해주세요.');
    }
    
    console.log(`Found ${javaFiles.length} Java Controller files`);
    
    // 2단계: AI 분석을 위한 프롬프트 생성
    onProgress?.('prepare', 'AI 모델이 코드를 분석할 수 있도록 데이터를 준비 중...');
    const codeAnalysisPrompt = generateAnalysisPrompt(javaFiles);

    // 3단계: AI API 호출
    onProgress?.('ai-analyze', 'AI 모델이 코드 구조를 분석하고 API 명세를 생성 중...');
    
    let aiResponse: string;
    if (aiModel === 'gemini') {
      aiResponse = await callGeminiAPI(apiKey, codeAnalysisPrompt);
    } else {
      aiResponse = await callOpenAIAPI(apiKey, codeAnalysisPrompt);
    }
    
    console.log('AI Response received:', aiResponse.substring(0, 200) + '...');
    
    // 4단계: AI 응답 파싱
    onProgress?.('generate', 'AI 분석 결과를 처리하고 최종 명세서를 생성 중...');
    
    // JSON 추출 (AI 응답에서 JSON 부분만 추출)
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON found in AI response:', aiResponse);
      throw new Error('AI 응답에서 유효한 JSON을 찾을 수 없습니다.');
    }
    
    let analysisResult: AnalysisResult;
    try {
      analysisResult = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('JSON parsing failed:', jsonMatch[0]);
      throw new Error('AI 응답의 JSON 형식이 올바르지 않습니다.');
    }
    
    console.log('Analysis completed successfully:', analysisResult);
    return analysisResult;
    
  } catch (error) {
    console.error('JAR file analysis failed:', error);
    throw error;
  }
};

// Re-export the convertToMarkdown function for backward compatibility
export { convertToMarkdown } from './markdownConverter';
