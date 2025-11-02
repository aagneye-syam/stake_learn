"use client";

import { CourseModuleResource } from "@/services/course.service";
import { useState } from "react";
import { Play, FileText, ChevronDown, ChevronUp } from "lucide-react";

interface ModuleContentViewerProps {
  moduleName: string;
  resources: CourseModuleResource[];
}

export function ModuleContentViewer({ moduleName, resources }: ModuleContentViewerProps) {
  const [expandedResources, setExpandedResources] = useState<Set<string>>(new Set());

  const toggleResource = (resourceId: string) => {
    const newExpanded = new Set(expandedResources);
    if (newExpanded.has(resourceId)) {
      newExpanded.delete(resourceId);
    } else {
      newExpanded.add(resourceId);
    }
    setExpandedResources(newExpanded);
  };

  const getYouTubeEmbedUrl = (url: string): string | null => {
    try {
      const urlObj = new URL(url);
      let videoId = '';
      
      if (urlObj.hostname.includes('youtube.com')) {
        videoId = urlObj.searchParams.get('v') || '';
      } else if (urlObj.hostname.includes('youtu.be')) {
        videoId = urlObj.pathname.slice(1);
      }
      
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    } catch {
      return null;
    }
  };

  if (!resources || resources.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-500">
        No learning resources available for this module yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {resources.map((resource) => {
        const isExpanded = expandedResources.has(resource.id);
        const isVideo = resource.type === 'video';
        const embedUrl = isVideo && resource.url ? getYouTubeEmbedUrl(resource.url) : null;

        return (
          <div key={resource.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleResource(resource.id)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isVideo ? 'bg-red-100' : 'bg-blue-100'}`}>
                  {isVideo ? (
                    <Play className="h-4 w-4 text-red-600" />
                  ) : (
                    <FileText className="h-4 w-4 text-blue-600" />
                  )}
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-900">{resource.title}</div>
                  <div className="text-xs text-gray-500">
                    {isVideo ? 'Video Lesson' : 'Text Content'}
                  </div>
                </div>
              </div>
              {isExpanded ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </button>
            
            {isExpanded && (
              <div className="border-t border-gray-200 p-4 bg-gray-50">
                {isVideo && embedUrl ? (
                  <div className="aspect-video w-full">
                    <iframe
                      src={embedUrl}
                      title={resource.title}
                      className="w-full h-full rounded-lg"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : isVideo && resource.url ? (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Video URL:</p>
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:underline text-sm break-all"
                    >
                      {resource.url}
                    </a>
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap">{resource.content}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
