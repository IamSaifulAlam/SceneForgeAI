import { ProfileEditor } from '@/components/admin/profile-editor';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default async function ProfilePage() {
  return (
    <Card className="border-dashed h-full flex flex-col">
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
        <CardDescription>
          Change your admin password here. Please note that for security reasons, this action is simulated in this environment and will not permanently change the password.
        </CardDescription>
      </CardHeader>
      <ProfileEditor />
    </Card>
  );
}
