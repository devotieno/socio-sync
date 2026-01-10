import ScheduleManager from '@/components/ScheduleManager';

export default function ScheduleManagerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-outfit font-bold text-white">Scheduled Posts Manager</h1>
        <p className="text-slate-400 mt-2">
          Manage and process scheduled posts. This is a development tool to manually trigger scheduled post publishing.
        </p>
      </div>
      
      <ScheduleManager />
      
      <div className="backdrop-blur-xl bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6">
        <h2 className="font-outfit font-semibold text-white mb-2">Development Note:</h2>
        <p className="text-slate-300 text-sm">
          In a production environment, you would set up a cron job or scheduled task to automatically call the 
          <code className="bg-slate-700 text-white px-2 py-0.5 rounded">/api/posts/publish-scheduled</code> endpoint every minute or 
          every few minutes to process due posts automatically.
        </p>
        <p className="text-slate-300 text-sm mt-2">
          For platforms like Vercel, you can use Vercel Cron Jobs. For other platforms, consider using services 
          like GitHub Actions, AWS Lambda, or external cron services.
        </p>
      </div>
    </div>
  );
}
