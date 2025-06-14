import { AppLayout } from '@/components/layout/AppLayout';
import { QandAClient } from '@/components/q-and-a/QandAClient';

export default function QandAPage() {
  return (
    <AppLayout>
      <div className="container mx-auto py-8">
        <QandAClient />
      </div>
    </AppLayout>
  );
}
