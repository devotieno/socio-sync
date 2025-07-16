import ScheduleManager from '@/components/ScheduleManager';

export default function ScheduleManagerPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Scheduled Posts Manager</h1>
        <p className="text-gray-600 mt-2">
          Manage and process scheduled posts. This is a development tool to manually trigger scheduled post publishing.
        </p>
      </div>
      
      <ScheduleManager />
      
      <div className="mt-8 bg-blue-50 p-4 rounded-md">
        <h2 className="font-semibold text-blue-800 mb-2">Development Note:</h2>
        <p className="text-blue-700 text-sm">
          In a production environment, you would set up a cron job or scheduled task to automatically call the 
          <code className="bg-blue-100 px-1 rounded">/api/posts/publish-scheduled</code> endpoint every minute or 
          every few minutes to process due posts automatically.
        </p>
        <p className="text-blue-700 text-sm mt-2">
          For platforms like Vercel, you can use Vercel Cron Jobs. For other platforms, consider using services 
          like GitHub Actions, AWS Lambda, or external cron services.
        </p>
      </div>
    </div>
  );
}
