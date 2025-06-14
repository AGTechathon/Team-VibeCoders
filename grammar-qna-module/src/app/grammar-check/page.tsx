import { AppLayout } from '@/components/layout/AppLayout';
import { GrammarCheckClient } from '@/components/grammar-check/GrammarCheckClient';

export default function GrammarCheckPage() {
  return (
    <AppLayout>
      <div className="container mx-auto py-8">
        <GrammarCheckClient />
      </div>
    </AppLayout>
  );
}
