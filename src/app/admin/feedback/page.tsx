import { getFeedback } from '../actions';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { FeedbackList } from '@/components/admin/feedback/FeedbackList';
import { Inbox } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function FeedbackPage() {
  const feedbackItems = await getFeedback();

  return (
    <div className="space-y-8">
      <AdminPageHeader 
        title="User Feedback" 
        subtitle="Direct messages, bug reports, and feature requests."
      >
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full">
            <Inbox className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-400">
                {feedbackItems.length} Messages
            </span>
        </div>
      </AdminPageHeader>

      <FeedbackList initialFeedback={feedbackItems} />
    </div>
  );
}
