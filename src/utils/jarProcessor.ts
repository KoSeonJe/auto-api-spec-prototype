
import JSZip from 'jszip';

export const extractJavaFilesFromJar = async (jarFile: File): Promise<string[]> => {
  try {
    console.log('Extracting files from JAR:', jarFile.name);
    
    const zip = new JSZip();
    const contents = await zip.loadAsync(jarFile);
    const javaFiles: string[] = [];
    
    // JAR 파일 내의 모든 파일을 순회
    for (const [filePath, file] of Object.entries(contents.files)) {
      // .java 파일이고 Controller가 포함된 파일만 추출
      if (filePath.endsWith('.java') && 
          (filePath.includes('Controller') || filePath.toLowerCase().includes('controller'))) {
        
        if (!file.dir) {
          const content = await file.async('text');
          javaFiles.push(content);
          console.log(`Extracted Java file: ${filePath}`);
        }
      }
    }
    
    console.log(`Found ${javaFiles.length} Java Controller files in JAR`);
    return javaFiles;
  } catch (error) {
    console.error('Failed to extract files from JAR:', error);
    throw new Error('JAR 파일을 읽는 중 오류가 발생했습니다.');
  }
};
