import React from 'react';
import DocItem from '@theme-original/DocItem';
import ProtectedContent from '@site/src/components/ProtectedContent';
import ChapterToolbar from '@site/src/components/ChapterToolbar';
import { useAuth } from '@site/src/contexts/AuthContext';

export default function DocItemWrapper(props) {
  const { isAuthenticated } = useAuth();
  const { content: DocContent } = props;
  const title = DocContent?.metadata?.title || '';

  return (
    <ProtectedContent>
      {/* Show toolbar only when authenticated */}
      {isAuthenticated && (
        <ChapterToolbar chapterTitle={title} />
      )}
      <DocItem {...props} />
    </ProtectedContent>
  );
}
