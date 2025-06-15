import { useState } from 'react';
import jsPDF from 'jspdf';
import { ChatMessage } from '../types';

export const usePDFExport = () => {
  const [isExporting, setIsExporting] = useState(false);

  const exportToPDF = async (messages: ChatMessage[], filename: string = 'MentoraX-Study-Session') => {
    if (messages.length === 0) return;

    setIsExporting(true);

    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const maxWidth = pageWidth - (margin * 2);
      let yPosition = margin;

      // Helper function to check if we need a new page
      const checkNewPage = (requiredSpace: number = 20) => {
        if (yPosition + requiredSpace > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
          return true;
        }
        return false;
      };

      // Add header
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(75, 85, 99); // Gray-600
      pdf.text('MentoraX Study Session', margin, yPosition);
      yPosition += 12;

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(107, 114, 128); // Gray-500
      pdf.text(`Generated on: ${new Date().toLocaleString()}`, margin, yPosition);
      pdf.text(`Total Messages: ${messages.length}`, margin, yPosition + 6);
      yPosition += 25;

      // Add separator line
      pdf.setDrawColor(229, 231, 235); // Gray-200
      pdf.setLineWidth(0.5);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 15;

      // Process each message
      for (let i = 0; i < messages.length; i++) {
        const message = messages[i];
        
        checkNewPage(30);

        // Message header with better styling
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        
        if (message.type === 'user') {
          pdf.setTextColor(99, 102, 241); // Indigo-500
          pdf.text('You', margin, yPosition);
        } else {
          pdf.setTextColor(20, 184, 166); // Teal-500
          pdf.text('AI Assistant', margin, yPosition);
        }
        
        // Timestamp
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(156, 163, 175); // Gray-400
        const timestamp = message.timestamp.toLocaleString();
        pdf.text(timestamp, pageWidth - margin - pdf.getTextWidth(timestamp), yPosition);
        yPosition += 12;

        // Message content with better formatting
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(55, 65, 81); // Gray-700
        
        const contentLines = pdf.splitTextToSize(message.content, maxWidth);
        contentLines.forEach((line: string) => {
          checkNewPage();
          pdf.text(line, margin, yPosition);
          yPosition += 6;
        });
        yPosition += 8;

        // Study content with enhanced formatting
        if (message.studyContent) {
          const { studyContent } = message;

          // Summary section
          if (studyContent.summary) {
            checkNewPage(25);
            
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(16, 185, 129); // Emerald-500
            pdf.text('📋 Summary', margin, yPosition);
            yPosition += 10;
            
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(75, 85, 99); // Gray-600
            
            const summaryLines = pdf.splitTextToSize(studyContent.summary, maxWidth - 10);
            summaryLines.forEach((line: string) => {
              checkNewPage();
              pdf.text(line, margin + 5, yPosition);
              yPosition += 5;
            });
            yPosition += 10;
          }

          // Key Points section
          if (studyContent.keyPoints && studyContent.keyPoints.length > 0) {
            checkNewPage(25);
            
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(99, 102, 241); // Indigo-500
            pdf.text('🔑 Key Concepts', margin, yPosition);
            yPosition += 10;
            
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(75, 85, 99); // Gray-600
            
            studyContent.keyPoints.forEach((point, index) => {
              checkNewPage(8);
              
              const bulletPoint = `${index + 1}. ${point}`;
              const pointLines = pdf.splitTextToSize(bulletPoint, maxWidth - 15);
              
              pointLines.forEach((line: string, lineIndex: number) => {
                checkNewPage();
                pdf.text(line, margin + (lineIndex === 0 ? 10 : 15), yPosition);
                yPosition += 5;
              });
              yPosition += 2;
            });
            yPosition += 8;
          }

          // Detailed Explanation section
          if (studyContent.detailedExplanation) {
            checkNewPage(25);
            
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(147, 51, 234); // Purple-600
            pdf.text('📖 Detailed Explanation', margin, yPosition);
            yPosition += 10;
            
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(75, 85, 99); // Gray-600
            
            // Handle line breaks in detailed explanation
            const explanationParagraphs = studyContent.detailedExplanation.split('\n\n');
            
            explanationParagraphs.forEach((paragraph, paragraphIndex) => {
              if (paragraph.trim()) {
                const paragraphLines = pdf.splitTextToSize(paragraph.trim(), maxWidth - 10);
                
                paragraphLines.forEach((line: string) => {
                  checkNewPage();
                  pdf.text(line, margin + 5, yPosition);
                  yPosition += 5;
                });
                
                // Add space between paragraphs
                if (paragraphIndex < explanationParagraphs.length - 1) {
                  yPosition += 5;
                }
              }
            });
            yPosition += 10;
          }
        }

        // Add separator between messages
        if (i < messages.length - 1) {
          checkNewPage(10);
          pdf.setDrawColor(243, 244, 246); // Gray-100
          pdf.setLineWidth(0.3);
          pdf.line(margin, yPosition, pageWidth - margin, yPosition);
          yPosition += 15;
        }
      }

      // Add footer to last page
      const totalPages = pdf.internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(156, 163, 175); // Gray-400
        pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 20, pageHeight - 10);
        pdf.text('Generated by MentoraX AI Study Platform', margin, pageHeight - 10);
      }

      // Save the PDF
      pdf.save(`${filename}-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportToPDF,
    isExporting
  };
};