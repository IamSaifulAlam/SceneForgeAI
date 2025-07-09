import { promises as fs } from 'fs';
import path from 'path';
import { SiteSettingsEditor } from '@/components/admin/site-settings-editor';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

async function getSiteSettings() {
  try {
    // Read site config
    const configPath = path.join(process.cwd(), 'src', 'config', 'site.ts');
    const configContent = await fs.readFile(configPath, 'utf8');
    const nameMatch = configContent.match(/name: '(.*?)'/);
    const descriptionMatch = configContent.match(/description: '(.*?)'/);
    const enableShrinkingHeaderMatch = configContent.match(/enableShrinkingHeader:\s*(true|false)/);
    const headerMaxHeightMatch = configContent.match(/headerMaxHeight:\s*(\d+)/);
    const headerMinHeightMatch = configContent.match(/headerMinHeight:\s*(\d+)/);

    const siteName = nameMatch ? nameMatch[1] : '';
    const siteDescription = descriptionMatch ? descriptionMatch[1] : '';
    const enableShrinkingHeader = enableShrinkingHeaderMatch ? enableShrinkingHeaderMatch[1] === 'true' : false;
    const headerMaxHeight = headerMaxHeightMatch ? parseInt(headerMaxHeightMatch[1], 10) : 96;
    const headerMinHeight = headerMinHeightMatch ? parseInt(headerMinHeightMatch[1], 10) : 64;
    
    // Read colors from CSS
    const cssPath = path.join(process.cwd(), 'src', 'app', 'globals.css');
    const cssContent = await fs.readFile(cssPath, 'utf8');

    const getColorValue = (theme: string, property: string) => {
      const regex = new RegExp(`${theme}\\s*{[^}]*--${property}:\\s*([^;]+)`);
      const match = cssContent.match(regex);
      return match ? match[1].trim() : '';
    };

    const settings = {
      siteName,
      siteDescription,
      enableShrinkingHeader,
      headerMaxHeight,
      headerMinHeight,
      lightBackground: getColorValue(':root', 'background'),
      lightPrimary: getColorValue(':root', 'primary'),
      lightAccent: getColorValue(':root', 'accent'),
      darkBackground: getColorValue('\\.dark', 'background'),
      darkPrimary: getColorValue('\\.dark', 'primary'),
      darkAccent: getColorValue('\\.dark', 'accent'),
    };

    return settings;
  } catch (error) {
    console.error("Failed to read site settings:", error);
    // Return default values to prevent the page from crashing on render.
    return {
      siteName: "Error Loading",
      siteDescription: "Could not load settings from files.",
      enableShrinkingHeader: false,
      headerMaxHeight: 96,
      headerMinHeight: 64,
      lightBackground: "",
      lightPrimary: "",
      lightAccent: "",
      darkBackground: "",
      darkPrimary: "",
      darkAccent: "",
    };
  }
}

export default async function SiteSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <Card className="border-dashed h-full flex flex-col">
      <CardHeader>
        <CardTitle>Edit Site Settings</CardTitle>
        <CardDescription>
          Modify your site's name, description, and theme colors. Changes will apply globally.
        </CardDescription>
      </CardHeader>
      <SiteSettingsEditor settings={settings} />
    </Card>
  );
}
