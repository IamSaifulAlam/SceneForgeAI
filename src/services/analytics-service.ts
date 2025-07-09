'use server';
/**
 * @fileOverview A stateful, in-memory analytics service.
 * This service simulates a real database by holding data in memory for the
 * lifetime of the server process. It tracks users and generation events
 * to provide real-time analytics for the dashboard.
 */
import { formatDistanceToNow } from 'date-fns';

// In-memory data stores to simulate a database.
// In a real application, these would be replaced with a persistent database like Firestore.
const users = new Map<string, UserRecord>();
const generationEvents: GenerationEvent[] = [];

interface UserRecord {
  id: string;
  type: 'Registered' | 'Anonymous';
  firstSeen: Date;
  lastSeen: Date;
  generations: GenerationEvent[];
}

interface GenerationEvent {
  userId: string;
  timestamp: Date;
  language: string;
  visualStyle: string;
  scenesCount: number;
}

// Ensure the admin user always exists for tracking purposes
if (!users.has('admin@********.com')) {
    const adminUser: UserRecord = {
        id: 'admin@********.com',
        type: 'Registered',
        firstSeen: new Date(),
        lastSeen: new Date(),
        generations: [],
    };
    users.set(adminUser.id, adminUser);
}

/**
 * Tracks a new generation event and updates the user record.
 * This is the primary entry point for logging new data.
 */
export async function trackGeneration(eventData: {
  userId: string;
  language: string;
  visualStyle: string;
  scenesCount: number;
}) {
  const now = new Date();
  const { userId } = eventData;

  // Create or update user record
  if (!users.has(userId)) {
    users.set(userId, {
      id: userId,
      type: 'Anonymous',
      firstSeen: now,
      lastSeen: now,
      generations: [],
    });
  }
  
  const user = users.get(userId)!;
  user.lastSeen = now;

  // Create and store the new generation event
  const newEvent: GenerationEvent = {
    userId,
    timestamp: now,
    language: eventData.language || 'Unknown',
    visualStyle: eventData.visualStyle || 'Unknown',
    scenesCount: eventData.scenesCount,
  };
  generationEvents.push(newEvent);
  user.generations.push(newEvent);
}


// --- Dashboard Analytics Functions ---

/**
 * Returns an overview of key analytics metrics.
 * Note: The 'change' percentages are still simulated for demonstration.
 */
export async function getAnalyticsOverview() {
  const totalGenerations = generationEvents.reduce((sum, event) => sum + event.scenesCount, 0);
  
  return {
    totalGenerations,
    totalUsers: users.size,
  };
}

/**
 * Returns the number of generations for each day of the current week.
 */
export async function getWeeklyGenerations() {
  const weeklyData: Record<string, number> = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1)); // Monday as start
  startOfWeek.setHours(0, 0, 0, 0);

  generationEvents.forEach(event => {
    if (event.timestamp >= startOfWeek) {
      const day = event.timestamp.toLocaleString('en-US', { weekday: 'short' });
      weeklyData[day] = (weeklyData[day] || 0) + event.scenesCount;
    }
  });

  return Object.entries(weeklyData).map(([day, generations]) => ({ day, generations }));
}

/**
 * Returns the distribution of languages used in prompts.
 */
export async function getLanguageDistribution() {
  const langCounts: Record<string, number> = {};
  generationEvents.forEach(event => {
    const lang = (event.language || 'Unknown').toLowerCase();
    langCounts[lang] = (langCounts[lang] || 0) + 1;
  });

  const total = Object.values(langCounts).reduce((sum, count) => sum + count, 0);
  if (total === 0) return [];

  const sortedLangs = Object.entries(langCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  
  const otherCount = Object.values(langCounts).reduce((sum, count) => sum + count, 0) - sortedLangs.reduce((sum, [, count]) => sum + count, 0);
  
  const distribution = sortedLangs.map(([name, count], index) => ({
    name: name,
    label: name.charAt(0).toUpperCase() + name.slice(1),
    value: Math.round((count / total) * 100),
    fill: `var(--color-${name.toLowerCase()})`,
    chartColor: (index + 1) as 1|2|3|4|5,
  }));

  if (otherCount > 0) {
    distribution.push({
      name: 'other',
      label: 'Other',
      value: Math.round((otherCount / total) * 100),
      fill: `var(--color-other)`,
      chartColor: 4,
    });
  }

  return distribution;
}

/**
 * Returns the most popular visual style and its trend.
 */
export async function getFavoriteVisualStyle() {
  const styleCounts: Record<string, number> = {};
  generationEvents.forEach(event => {
    const style = event.visualStyle || 'N/A';
    styleCounts[style] = (styleCounts[style] || 0) + 1;
  });

  const favorite = Object.entries(styleCounts).sort((a, b) => b[1] - a[1])[0];

  return {
    name: favorite ? favorite[0] : 'N/A',
    count: favorite ? favorite[1] : 0,
  };
}

/**
 * Returns statistics about registered vs. anonymous users.
 */
export async function getUserStats() {
    let registeredCount = 0;
    let anonymousCount = 0;
    
    users.forEach(user => {
        if (user.type === 'Registered') registeredCount++;
        else anonymousCount++;
    });

    const totalUsers = users.size;
    const totalGenerations = generationEvents.reduce((sum, event) => sum + event.scenesCount, 0);

    return {
        total: totalUsers,
        registered: registeredCount,
        anonymous: anonymousCount,
        generationsPerUser: totalUsers > 0 ? totalGenerations / totalUsers : 0,
    };
}

/**
 * Returns a list of recently active users.
 */
export async function getRecentUsers() {
    const sortedUsers = Array.from(users.values()).sort((a, b) => b.lastSeen.getTime() - a.lastSeen.getTime());
    
    return sortedUsers.slice(0, 10).map(user => ({
      id: user.type === 'Registered' ? user.id : `${user.id.substring(0, 8)}-....-${user.id.substring(user.id.length - 12)}`,
      type: user.type,
      generations: user.generations.reduce((sum, event) => sum + event.scenesCount, 0),
      lastSeen: formatDistanceToNow(user.lastSeen, { addSuffix: true }),
      firstSeen: formatDistanceToNow(user.firstSeen, { addSuffix: true }),
    }));
}
