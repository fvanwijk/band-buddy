import { IconMoodSadDizzy } from '@tabler/icons-react';
import { isRouteErrorResponse, useRouteError } from 'react-router-dom';

import { EmptyLayout } from './EmptyLayout';
import { EmptyState } from './ui/EmptyState';
import { Page } from './ui/Page';
import { PageHeader } from './ui/PageHeader';

export function NotFoundPage() {
  const error = useRouteError();
  const title = isRouteErrorResponse(error) ? error.statusText : (error as Error).message;
  const subtitle = isRouteErrorResponse(error) ? error.status.toString() : undefined;

  return (
    <EmptyLayout>
      <Page>
        <PageHeader backPath="/play" title="Error" subtitle={subtitle ?? 'Oops'} />
        <EmptyState
          description="The page you are looking for does not exist."
          title={title}
          icon={<IconMoodSadDizzy />}
        />
      </Page>
    </EmptyLayout>
  );
}
