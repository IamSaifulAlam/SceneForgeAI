import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import * as AnalyticsService from '@/services/analytics-service';
import { Users, UserCheck, UserPlus, BarChart3 } from "lucide-react";

export default async function UsersPage() {
  const [userStats, recentUsers] = await Promise.all([
    AnalyticsService.getUserStats(),
    AnalyticsService.getRecentUsers(),
  ]);

  return (
    <div className="flex-1 space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold tracking-tighter font-headline">User Management</h1>
        <p className="text-muted-foreground">An overview of registered and anonymous users.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Unique Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Unique users this session
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registered Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.registered.toLocaleString()}</div>
             <p className="text-xs text-muted-foreground">
              (Includes the admin user)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Anonymous Users</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.anonymous.toLocaleString()}</div>
             <p className="text-xs text-muted-foreground">
              Tracked via anonymous cookie
            </p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Generations per User</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.generationsPerUser.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Average across all users</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Users</CardTitle>
          <CardDescription>A list of the most recently active users.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Generations</TableHead>
                <TableHead>Last Seen</TableHead>
                <TableHead>First Seen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-mono text-xs">{user.id}</TableCell>
                  <TableCell>
                    <Badge variant={user.type === 'Registered' ? 'default' : 'secondary'}>
                        {user.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{user.generations}</TableCell>
                  <TableCell>{user.lastSeen}</TableCell>
                  <TableCell>{user.firstSeen}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
