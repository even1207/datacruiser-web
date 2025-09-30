import { useState, useCallback } from 'react';
import { Message, CSVData, VisualizationConfig } from '../types';
import { processCSVFile } from '../utils/csvProcessor';
import { postJSON, uploadFiles, AskResponse } from '../config/api';

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<CSVData[]>([]);
  const [currentVisualizations, setCurrentVisualizations] = useState<VisualizationConfig[]>([]);

  const addMessage = useCallback((message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  }, []);

  const simulateAIResponse = useCallback(async (userMessage: string, csvData?: CSVData) => {
    setIsLoading(true);
    
    // Simulate AI thinking time
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2000));
    
    let response = '';
    let visualizations: VisualizationConfig[] = [];
    
    if (csvData) {
      // Ask backend about the uploaded dataset
      try {
        const datasetId = (csvData as any).dataset_id as string | undefined;
        if (datasetId) {
          const res = await postJSON<AskResponse>(`/datasets/${datasetId}/ask`, {
            question: userMessage || 'Please analyze this dataset and suggest key insights and charts.'
          });
          response = res.answer || 'No answer returned.';
          // Map chart suggestions to our visualization configs (basic mapping)
          if (res.chart_suggestions && res.chart_suggestions.length > 0 && csvData.columns.length >= 2) {
            visualizations = res.chart_suggestions.slice(0, 1).map(s => ({
              type: 'chart',
              chartType: (s.chart_type as any) || 'bar',
              data: csvData.data.slice(0, 50),
              xAxis: s.columns[0] || csvData.columns[0],
              yAxis: s.columns[1] || csvData.columns[1],
              title: `${(s.chart_type || 'Chart').toUpperCase()} suggestion`,
              description: s.reason || 'Suggested by backend'
            }));
          }
        } else {
          response = `File "${csvData.name}" uploaded. Backend dataset_id missing; please upload via API to enable backend analysis.`;
        }
      } catch (e: any) {
        response = `Backend error: ${e.message}`;
      }
    } else {
      // Ask backend generic question without dataset
      try {
        const res = await postJSON<AskResponse>(`/ask`, {
          question: userMessage,
          top_k: 5
        });
        response = res.answer || 'No answer returned.';
      } catch (e: any) {
        response = `Backend error: ${e.message}`;
      }
    }
    
    // Add AI response with streaming effect
    const aiMessage = addMessage({
      type: 'assistant',
      content: '',
      isStreaming: true
    });
    
    // Simulate streaming response
    const words = response.split(' ');
    let currentContent = '';
    
    for (let i = 0; i < words.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
      currentContent += (i > 0 ? ' ' : '') + words[i];
      
      setMessages(prev => prev.map(msg => 
        msg.id === aiMessage.id 
          ? { ...msg, content: currentContent }
          : msg
      ));
    }
    
    // Mark streaming as complete
    setMessages(prev => prev.map(msg => 
      msg.id === aiMessage.id 
        ? { ...msg, isStreaming: false }
        : msg
    ));
    
    // Update visualizations
    if (visualizations.length > 0) {
      setCurrentVisualizations(visualizations);
    }
    
    setIsLoading(false);
  }, [addMessage]);

  const handleSendMessage = useCallback(async (content: string) => {
    // Add user message
    addMessage({
      type: 'user',
      content
    });
    
    // Get the most recent uploaded file for context
    const latestFile = uploadedFiles[uploadedFiles.length - 1];
    
    // Generate AI response via backend
    await simulateAIResponse(content, latestFile);
  }, [addMessage, simulateAIResponse, uploadedFiles]);

  const handleFileUpload = useCallback(async (file: File) => {
    try {
      setIsLoading(true);
      
      // Upload to backend first to get dataset_id
      const form = new FormData();
      form.append('files', file);
      const uploadRes = await uploadFiles(form);
      const datasetId = uploadRes.dataset?.dataset_id;

      // Also parse locally for client-side visualization scaffolding
      const processedData = await processCSVFile(file);

      const csvData: CSVData = {
        id: datasetId || Date.now().toString(),
        name: file.name,
        data: processedData.data,
        columns: processedData.columns,
        uploadedAt: new Date(),
        metadata: processedData.metadata
      } as any;
      (csvData as any).dataset_id = datasetId;

      setUploadedFiles(prev => [...prev, csvData]);

      addMessage({
        type: 'assistant',
        content: datasetId
          ? `File "${file.name}" uploaded. Dataset ID: ${datasetId}. Ask a question to analyze it.`
          : `File "${file.name}" uploaded locally. Backend did not return dataset_id.`
      });

      // Trigger backend analysis prompt
      await simulateAIResponse('Please analyze this dataset and suggest key insights.', csvData);
      
    } catch (error) {
      console.error('Error processing CSV:', error);
      addMessage({
        type: 'assistant',
        content: 'Sorry, I encountered an error processing your CSV file. Please make sure the file is properly formatted and try again.'
      });
      setIsLoading(false);
    }
  }, [addMessage, simulateAIResponse]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setCurrentVisualizations([]);
    setUploadedFiles([]);
  }, []);

  return {
    messages,
    isLoading,
    uploadedFiles,
    currentVisualizations,
    handleSendMessage,
    handleFileUpload,
    clearChat
  };
};
