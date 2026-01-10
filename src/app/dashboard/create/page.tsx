'use client';

import { useRouter } from 'next/navigation';
import { MultiPlatformPostCreator } from '@/components/MultiPlatformPostCreator';
import toast from 'react-hot-toast';

export default function CreatePostPage() {
  const router = useRouter();

  const handlePostCreated = (posts: any[]) => {
    toast.success(`Posted to ${posts.length} platform(s) successfully!`);
    router.push('/dashboard/posts');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create New Tweet</h1>
        <p className="mt-2 text-gray-600">
          Compose and publish tweets to your connected Twitter/X accounts.
        </p>
      </div>

      {/* Multi-Platform Post Creator */}
      <MultiPlatformPostCreator onPostCreated={handlePostCreated} />

      {/* Information Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          Twitter/X Publishing
        </h3>
        <div className="text-sm text-blue-800 space-y-2">
          <p>• Connect your Twitter/X accounts in the Accounts section</p>
          <p>• 280 character limit per tweet</p>
          <p>• Schedule tweets for optimal engagement times</p>
          <p>• Support for images and videos</p>
        </div>
      </div>
    </div>
  );
}
