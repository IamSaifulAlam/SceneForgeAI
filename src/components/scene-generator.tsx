
"use client";

import React, { useState, useEffect, useRef, useActionState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import Image from 'next/image';
import { zodResolver } from '@hookform/resolvers/zod';
import { sceneSchema, type SceneFormData, singleSceneSchema } from '@/lib/types';
import { generateSceneAction, type FormState, generateImageAction, type ImageFormState, regenerateSingleSceneAction, type RegenFormState } from '@/lib/actions';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, Clapperboard, RefreshCw, AlertTriangle, Settings2, Wand2, History, Download, FileJson, FileText, Trash2, BookCheck, ImageIcon, Ban, Copy } from 'lucide-react';
import { snakeToCamel, cn } from '@/lib/utils';
import { CustomSelect } from '@/components/ui/custom-select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { SceneGenerationOutput } from '@/ai/flows/generate-cinematic-scene';
import type { z } from 'zod';

interface FormItem {
  label: string;
  prompt: string;
}

interface SceneGeneratorProps {
  formItems: Record<string, FormItem[]>;
}

type HistoryEntry = SceneGenerationOutput & { generatedAt: string };
type SingleScene = z.infer<typeof singleSceneSchema>;

const storyCategories = {
  english: [
    "A lone elf watches a crystal dragon fly over a moonlit city.", // Fantasy
    "A cyborg detective inspects a glitching hologram in a neon-drenched alley.", // Cyberpunk
    "A Viking longship crashes through an icy fjord towards an unknown shore.", // Adventure
    "An old woman secretly wins a video game tournament from her quiet apartment.", // Comedy
    "An abandoned space station's last message plays on a loop: 'Don't open the door'." // Mystery
  ],
  spanish: [
    "Una hechicera teje la luz de las estrellas para forjar una espada legendaria.", // Fantasy
    "Un mensajero con mejoras cibernéticas salta entre los rascacielos de una mega-ciudad.", // Cyberpunk
    "Un explorador descubre una ciudad perdida de oro en lo profundo de la selva amazónica.", // Adventure
    "Un gato callejero se convierte accidentalmente en el alcalde de un pequeño pueblo.", // Comedy
    "Un famoso detective encuentra un mapa del tesoro escondido en un viejo reloj de bolsillo." // Mystery
  ],
  mandarin: [
    "一位年轻的剑客在竹林深处与一位幽灵武士对峙。", // Fantasy
    "在赛博朋克上海的地下市场，一个黑客正在交易被盗的数据。", // Cyberpunk
    "一支探险队在喜马拉雅山脉中寻找传说中的香格里拉。", // Adventure
    "一个机器人管家误将一只宠物狗当成了外星入侵者。", // Comedy
    "紫禁城深处一幅古画中隐藏着一个被遗忘已久的秘密。" // Mystery
  ],
  hindi: [
    "एक जादूगर हिमालय की चोटी पर एक उड़ने वाले कालीन को बुलाता है।", // Fantasy
    "मुंबई की भविष्य की सड़कों पर, एक रोबोटिक स्ट्रीट फूड विक्रेता पानी पुरी बेचता है।", // Cyberpunk
    "एक पुरातत्वविद् राजस्थान के रेगिस्तान में एक खोए हुए किले का पता लगाता है।", // Adventure
    "एक बंदर गलती से एक बॉलीवुड फिल्म सेट का निर्देशक बन जाता है।", // Comedy
    "ताजमहल के नीचे एक गुप्त सुरंग एक अनकहे रहस्य की ओर ले जाती है।" // Mystery
  ],
  arabic: [
    "فارس يركب حصانًا مجنحًا فوق أهرامات الجيزة عند شروق الشمس.", // Fantasy
    "في دبي المستقبلية، طائرة بدون طيار توصل طردًا غامضًا إلى برج شاهق.", // Cyberpunk
    "مستكشف يتبع خريطة قديمة عبر الصحراء الكبرى للعثور على واحة أسطورية.", // Adventure
    "جمل يقرر المشاركة في سباق للخيول ويفوز بشكل غير متوقع.", // Comedy
    "رسالة غامضة مكتوبة بالهيروغليفية تظهر على جدران معبد قديم." // Mystery
  ],
  bangla: [
    "ঈদের রাতে পুরান ঢাকার আকাশে একটি ফানুস উড়ে যায়, যার ভেতরে একটি গোপন বার্তা রয়েছে।", // Mystery
    "পদ্মা নদীর বুকে একদল জেলে এমন একটি মাছ ধরে, যার আঁশগুলো সোনার মতো চকচক করে।", // Fantasy
    "ভবিষ্যতের ঢাকায়, একজন হ্যাকার ড্রোন ব্যবহার করে ট্রাফিক জ্যাম এড়িয়ে একটি গোপন তথ্য পাচার করছে।", // Cyberpunk
    "সুন্দরবনের গভীরে এক অভিযাত্রী দল একটি হারানো শহরের সন্ধান পায়, যা রয়েল বেঙ্গল টাইগারেরা পাহারা দেয়।", // Adventure
    "একটি বিড়াল ভুল করে প্রধানমন্ত্রীর অফিসে ঢুকে পড়ে এবং নিজেকে দেশের সবচেয়ে গুরুত্বপূর্ণ বিড়াল ভাবতে শুরু করে।" // Comedy
  ],
  japanese: [
    "桜の木の下で、狐の精霊が若い侍に魔法の刀を渡す。", // Fantasy
    "ネオンきらめく渋谷の交差点で、アンドロイドの探偵が事件を追う。", // Cyberpunk
    "忍者が嵐の中、城の屋根を駆け抜け、巻物を盗もうとする。", // Adventure
    "相撲取りが誤ってバレエのクラスに参加してしまう。", // Comedy
    "古都・京都の古い寺で、話す猫が失われた宝の謎を解く。" // Mystery
  ],
  urdu: [
    "ایک شہزادہ ہمالیہ کی وادیوں میں ایک پراسرار روشنی کا پیچھا کرتا ہے۔", // Fantasy
    "مستقبل کے کراچی میں، ایک سائبرگ رکشہ ڈرائیور نیون لائٹوں والی گلیوں سے گزرتا ہے۔", // Cyberpunk
    "ایک کوہ پیما کے ٹو کی چوٹی پر ایک قدیم نقشہ دریافت کرتا ہے۔", // Adventure
    "ایک باورچی غلطی سے بریانی میں مٹھائی ڈال دیتا ہے، اور وہ مشہور ہو جاتی ہے۔", // Comedy
    "لاہور کے شاہی قلعے میں ایک پوشیدہ کمرہ ایک بھولے ہوئے بادشاہ کا راز رکھتا ہے۔" // Mystery
  ],
  french: [
    "Un chevalier trouve l'épée Excalibur dans une forêt enchantée près de Brocéliande.", // Fantasy
    "Un détective privé androïde enquête sur une affaire dans les bas-fonds de Paris en 2077.", // Cyberpunk
    "Un alpiniste escalade le Mont Blanc pour y planter un drapeau mystérieux.", // Adventure
    "Un pigeon parisien vole une baguette fraîche d'une boulangerie et la partage avec ses amis.", // Comedy
    "Le fantôme d'une reine hante les couloirs du Château de Versailles, cherchant un bijou perdu." // Mystery
  ],
  german: [
    "Ein Zwergenschmied hämmert in den Tiefen des Schwarzwaldes ein magisches Amulett.", // Fantasy
    "Ein Bio-Ingenieur flieht durch die regnerischen Straßen von Berlin 2088 mit einer gestohlenen KI.", // Cyberpunk
    "Ein Archäologe entdeckt ein römisches Artefakt tief im bayerischen Wald.", // Adventure
    "Ein Dackel wird versehentlich zum Dirigenten der Berliner Philharmoniker ernannt.", // Comedy
    "In Schloss Neuschwanstein wird ein geheimes Tagebuch von König Ludwig II. gefunden." // Mystery
  ]
};

// Interleave the stories
const placeholders: string[] = [];
const languages = Object.keys(storyCategories);
const numStories = storyCategories[languages[0] as keyof typeof storyCategories].length;

for (let i = 0; i < numStories; i++) {
  for (const lang of languages) {
    placeholders.push(storyCategories[lang as keyof typeof storyCategories][i]);
  }
}

function RegenerateDialog({ isOpen, onOpenChange, scene, originalOutput, onSceneRegenerated }: { isOpen: boolean; onOpenChange: (open: boolean) => void; scene: SingleScene | null; originalOutput: SceneGenerationOutput | null; onSceneRegenerated: (newScene: SingleScene) => void; }) {
  const { toast } = useToast();
  const [state, formAction, isPending] = useActionState<RegenFormState, FormData>(regenerateSingleSceneAction, { success: false, message: '' });
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success && state.newScene) {
      toast({ title: 'Success', description: 'Scene has been regenerated.' });
      onSceneRegenerated(state.newScene);
      onOpenChange(false);
    } else if (state.success === false && state.message) {
      toast({ variant: 'destructive', title: 'Regeneration Failed', description: state.message });
    }
  }, [state, toast, onSceneRegenerated, onOpenChange]);

  if (!scene || !originalOutput) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Regenerate Scene {scene.scene_number}</DialogTitle>
          <DialogDescription>
            Provide feedback to the AI on what you'd like to change in this scene.
          </DialogDescription>
        </DialogHeader>
        <form
          ref={formRef}
          action={formAction}
          className="space-y-4"
        >
          <input type="hidden" name="originalOutput" value={JSON.stringify(originalOutput)} />
          <input type="hidden" name="sceneToRegenerate" value={JSON.stringify(scene)} />
          
          <Textarea
            name="userFeedback"
            placeholder="e.g., 'Make the dialogue more tense.' or 'Change the location to a rainy rooftop.'"
            rows={4}
            required
          />
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
              {isPending ? 'Regenerating...' : 'Regenerate'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SceneCard({ scene, isTranslated, onCopy, onDelete, onRegenerate, onImageGenerated }: { scene: SingleScene, isTranslated: boolean; onCopy: () => void; onDelete: () => void; onRegenerate: () => void; onImageGenerated: (sceneNumber: number, imageUrl: string) => void; }) {
  const [state, formAction, isPending] = useActionState<ImageFormState, FormData>(generateImageAction, { success: false, message: '' });
  const { toast } = useToast();

  useEffect(() => {
    if (state.success === false && state.message) {
      toast({
        variant: 'destructive',
        title: 'Image Generation Failed',
        description: state.message,
      });
    } else if (state.success && state.imageUrl) {
        onImageGenerated(scene.scene_number, state.imageUrl);
    }
  }, [state, toast, onImageGenerated, scene.scene_number]);

  const cardButtons = [
    { label: 'Visualize', icon: ImageIcon, action: formAction, disabled: isPending || !!scene.imageUrl || isTranslated, form: true },
    { label: 'Regenerate', icon: RefreshCw, action: onRegenerate, disabled: isPending },
    { label: 'Copy', icon: Copy, action: onCopy, disabled: isPending },
    { label: 'Delete', icon: Trash2, action: onDelete, disabled: isPending, className: 'hover:bg-destructive/10 hover:text-destructive' },
  ];

  return (
    <Card className="group relative">
      <CardHeader className="flex flex-row justify-between items-start">
        <CardTitle>Scene {scene.scene_number}</CardTitle>
        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-background/80 backdrop-blur-sm p-1 rounded-md border">
          {cardButtons.map((btn) => {
            const content = (
              <Button type={btn.form ? "submit" : "button"} variant="ghost" size="icon" disabled={btn.disabled} onClick={!btn.form ? btn.action : undefined} className={btn.className}>
                <btn.icon className="h-4 w-4" />
              </Button>
            );
            return (
              <TooltipProvider key={btn.label} delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    {btn.form ? (
                      <form action={btn.action}>
                        <input type="hidden" name="sceneDescription" value={scene.cinematic_description} />
                        {content}
                      </form>
                    ) : content}
                  </TooltipTrigger>
                  <TooltipContent><p>{btn.label}</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="font-mono text-sm space-y-4">
          <div>
            <p className="font-semibold text-muted-foreground mb-1">[Cinematic Description]</p>
            <p className="whitespace-pre-wrap">{scene.cinematic_description}</p>
          </div>
          {scene.voice_content && (
            <div>
              <p className="font-semibold text-muted-foreground mb-1">[Dialogue / Narration]</p>
              <p className="whitespace-pre-wrap">{scene.voice_content}</p>
            </div>
          )}
          {scene.consistency_notes && (
            <div>
              <p className="font-semibold text-muted-foreground mb-1">[Consistency Notes]</p>
              <p className="whitespace-pre-wrap">{scene.consistency_notes}</p>
            </div>
          )}
        </div>
        
        {isPending && (
          <div className="aspect-video w-full">
            <Skeleton className="h-full w-full rounded-lg flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <ImageIcon className="mx-auto h-12 w-12 animate-pulse" />
                <p className="mt-2">Generating image...</p>
              </div>
            </Skeleton>
          </div>
        )}
        {scene.imageUrl && !isPending && (
          <div className="aspect-video w-full relative rounded-lg overflow-hidden border">
            <Image
              src={scene.imageUrl}
              alt={`AI visualization of scene ${scene.scene_number}`}
              fill
              className="object-cover"
            />
          </div>
        )}
        {state.success === false && state.message && !state.imageUrl && (
           <div className="aspect-video w-full">
            <div className="h-full w-full rounded-lg bg-destructive/10 border border-destructive/50 flex flex-col items-center justify-center text-destructive p-4 text-center">
                <Ban className="h-12 w-12" />
                <p className="mt-2 font-semibold">Image Generation Failed</p>
                <p className="text-xs">{state.message}</p>
            </div>
           </div>
        )}
      </CardContent>
    </Card>
  );
}

export function SceneGenerator({ formItems }: SceneGeneratorProps) {
  const { toast } = useToast();
  const [state, formAction, isPending] = useActionState(generateSceneAction, { success: false, message: '' });
  const [generationResult, setGenerationResult] = useState<SceneGenerationOutput & { generatedAt: string } | null>(null);

  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [showHistoryButton, setShowHistoryButton] = useState(false);
  const [sceneToRegenerate, setSceneToRegenerate] = useState<SingleScene | null>(null);
  
  const placeholderRef = useRef<HTMLSpanElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const animationFrameId = useRef<number>();

  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('sceneForgeHistory');
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        setHistory(parsedHistory);
        setShowHistoryButton(parsedHistory.length > 0);
      }
    } catch (error) {
      console.error("Failed to parse history from localStorage", error);
      localStorage.removeItem('sceneForgeHistory');
    }
  }, []);

  const updateHistory = useCallback((newResult: HistoryEntry) => {
    setHistory((prevHistory) => {
      const existingIndex = prevHistory.findIndex(entry => entry.generatedAt === newResult.generatedAt);
      let updatedHistory;

      if (existingIndex !== -1) {
        // Update existing entry
        updatedHistory = [...prevHistory];
        updatedHistory[existingIndex] = newResult;
      } else {
        // Add new entry
        updatedHistory = [newResult, ...prevHistory].slice(0, 20); // Limit history
      }
      
      localStorage.setItem('sceneForgeHistory', JSON.stringify(updatedHistory));
      setShowHistoryButton(true);
      return updatedHistory;
    });
  }, []);

  // Effect to handle results from the server action
  useEffect(() => {
    if (state.success && state.data) {
      const newResult = { ...state.data, generatedAt: new Date().toISOString() };
      setGenerationResult(newResult);
      updateHistory(newResult);
    }
    
    // On failure, show a toast notification
    if (state.success === false && state.message) {
      if (!state.message.includes("validation")) {
        toast({
          variant: 'destructive',
          title: 'Generation Failed',
          description: state.message,
        });
      }
    }
  }, [state, toast, updateHistory]);


  useEffect(() => {
    let currentPhase = 'typing';
    let charIndex = 0;
    let placeholderIndex = 0;
    let timeoutId: NodeJS.Timeout;

    const animate = () => {
      const placeholderEl = placeholderRef.current;
      const cursorEl = cursorRef.current;
      if (!placeholderEl || !cursorEl) return;

      const fullText = placeholders[placeholderIndex];

      switch (currentPhase) {
        case 'typing':
          cursorEl.style.display = 'inline';
          placeholderEl.className = '';
          if (charIndex < fullText.length) {
            placeholderEl.textContent = fullText.substring(0, charIndex + 1);
            charIndex++;
            timeoutId = setTimeout(animate, 30);
          } else {
            currentPhase = 'pausing';
            timeoutId = setTimeout(animate, 1000);
          }
          break;

        case 'pausing':
          cursorEl.classList.add('animate-blink');
          currentPhase = 'selecting';
          timeoutId = setTimeout(animate, 500);
          break;

        case 'selecting':
          cursorEl.style.display = 'none';
          cursorEl.classList.remove('animate-blink');
          placeholderEl.className = 'box-decoration-clone bg-muted-foreground/80 text-background rounded-sm';
          currentPhase = 'clearing';
          timeoutId = setTimeout(animate, 500);
          break;

        case 'clearing':
          placeholderEl.textContent = '';
          placeholderEl.className = '';
          charIndex = 0;
          placeholderIndex = (placeholderIndex + 1) % placeholders.length;
          currentPhase = 'typing';
          timeoutId = setTimeout(animate, 500);
          break;
      }
    };

    animationFrameId.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      clearTimeout(timeoutId);
    };
  }, []);


  const form = useForm<SceneFormData>({
    resolver: zodResolver(sceneSchema),
    defaultValues: {
      numberOfScenes: 5,
      sceneDescription: '',
      voiceLanguage: formItems.voice_language?.[0]?.prompt || 'English',
      narrativeType: '',
      characterConsistency: '',
      location: '',
      mood: '',
      lighting: '',
      camera: '',
      visualStyle: '',
      weather: '',
      sound: '',
      timeOfDay: '',
      era: '',
      material: '',
      specialEffects: '',
    },
  });

  const { isDirty } = form.formState;

  const renderSelect = (name: keyof SceneFormData, label: string, options: FormItem[]) => {
    const sortedOptions = [...options].sort((a, b) => a.label.localeCompare(b.label));
    const comboboxOptions = sortedOptions.map(opt => ({ value: opt.prompt, label: opt.label }));
    return (
      <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <input type="hidden" name={field.name} value={field.value || ''} />
            <CustomSelect
              options={comboboxOptions}
              value={field.value}
              onChange={field.onChange}
              placeholder={`Select ${label.toLowerCase()}...`}
            />
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }

  const handleExport = (format: 'json' | 'txt') => {
    if (!generationResult) {
      toast({ variant: 'destructive', title: 'Export Error', description: 'No data to export.' });
      return;
    }

    const { scenes, master_scene_template } = generationResult;
    let content = '';
    let mimeType = '';
    let fileExtension = '';
    const timestamp = new Date().toISOString().replace(/:/g, '-');

    if (format === 'json') {
      const exportData = {
        appName: 'SceneForge AI',
        exportedAt: new Date().toISOString(),
        ...generationResult,
      };
      content = JSON.stringify(exportData, null, 2);
      mimeType = 'application/json';
      fileExtension = 'json';
    } else if (format === 'txt') {
      let txtContent = `SCENEFORGE AI EXPORT\n`;
      txtContent += `TITLE: ${generationResult.title}\n`;
      txtContent += `Generated at: ${new Date().toLocaleString()}\n\n`;
      txtContent += `--- MASTER SCENE TEMPLATE ---\n`;
      Object.entries(master_scene_template).forEach(([key, value]) => {
        txtContent += `${key.replace(/_/g, ' ').toUpperCase()}:\n${value}\n\n`;
      });
      txtContent += `--- SCENES ---\n\n`;
      scenes.forEach(scene => {
        txtContent += `## SCENE ${scene.scene_number}\n\n`;
        txtContent += `[CINEMATIC DESCRIPTION]\n${scene.cinematic_description}\n\n`;
        if (scene.voice_content) {
          txtContent += `[DIALOGUE / NARRATION]\n${scene.voice_content}\n\n`;
        }
        txtContent += `[CONSISTENCY NOTES]\n${scene.consistency_notes}\n\n`;
        txtContent += `--------------------\n\n`;
      });
      content = txtContent;
      mimeType = 'text/plain';
      fileExtension = 'txt';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sceneforge-export-${timestamp}.${fileExtension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const handleLoadFromHistory = (entry: HistoryEntry) => {
    setGenerationResult(entry);
    setIsHistoryOpen(false);
  };

  const handleClearHistory = () => {
    localStorage.removeItem('sceneForgeHistory');
    setHistory([]);
    setShowHistoryButton(false);
    toast({ title: 'Success', description: 'Your generation history has been cleared.' });
  };
  
  const handleCopyScene = (scene: SingleScene) => {
    let sceneText = `SCENE ${scene.scene_number}\n\n`;
    sceneText += `[CINEMATIC DESCRIPTION]\n${scene.cinematic_description}\n\n`;
    if (scene.voice_content) {
      sceneText += `[DIALOGUE / NARRATION]\n${scene.voice_content}\n\n`;
    }
    if (scene.consistency_notes) {
      sceneText += `[CONSISTENCY NOTES]\n${scene.consistency_notes}\n`;
    }
    navigator.clipboard.writeText(sceneText.trim());
    toast({ title: 'Copied!', description: `Scene ${scene.scene_number} copied to clipboard.` });
  };

  const handleDeleteScene = (sceneNumberToDelete: number) => {
    if (!generationResult) return;

    setGenerationResult(prev => {
        if (!prev) return null;
        const newScenes = prev.scenes
            .filter(scene => scene.scene_number !== sceneNumberToDelete)
            .map((scene, index) => ({ ...scene, scene_number: index + 1 }));

        const newTranslatedScenes = prev.translated_scenes
            ?.filter(scene => scene.scene_number !== sceneNumberToDelete)
            .map((scene, index) => ({ ...scene, scene_number: index + 1 }));
        
        const newResult = {
            ...prev,
            scenes: newScenes,
            translated_scenes: newTranslatedScenes,
        };
        updateHistory(newResult);
        return newResult;
    });

    toast({ title: 'Scene Deleted', description: `Scene ${sceneNumberToDelete} has been removed.` });
  };

  const handleSceneRegenerated = (newScene: SingleScene) => {
    if (!generationResult) return;

    setGenerationResult(prev => {
        if (!prev) return null;
        const newScenes = prev.scenes.map(scene =>
            scene.scene_number === newScene.scene_number ? newScene : scene
        );
        
        // Also update translated scenes if they exist, perhaps just remove the old one for simplicity
        const newTranslatedScenes = prev.translated_scenes?.map(scene =>
            scene.scene_number === newScene.scene_number ? { ...newScene, voice_content: scene.voice_content } : scene // Keep translated voice content if exists
        );

        const newResult = {
            ...prev,
            scenes: newScenes,
            translated_scenes: newTranslatedScenes,
        };
        updateHistory(newResult);
        return newResult;
    });
  };

  const handleImageGenerated = useCallback((sceneNumber: number, imageUrl: string) => {
    setGenerationResult(prev => {
        if (!prev) return null;

        const newScenes = prev.scenes.map(s => 
            s.scene_number === sceneNumber ? { ...s, imageUrl } : s
        );

        const newTranslatedScenes = prev.translated_scenes?.map(s => 
            s.scene_number === sceneNumber ? { ...s, imageUrl } : s
        );
        
        const newResult = {
            ...prev,
            scenes: newScenes,
            translated_scenes: newTranslatedScenes,
        };

        updateHistory(newResult);
        return newResult;
    });
  }, [updateHistory]);


  const mainOptions = ['location', 'mood', 'lighting', 'camera'];
  const advancedOptions = ['visual style', 'weather', 'sound', 'time of day', 'era', 'material', 'special effects', 'narrative type', 'character consistency'];

  return (
    <>
      <RegenerateDialog
        isOpen={!!sceneToRegenerate}
        onOpenChange={(open) => !open && setSceneToRegenerate(null)}
        scene={sceneToRegenerate}
        originalOutput={generationResult}
        onSceneRegenerated={handleSceneRegenerated}
      />
      <div className="grid grid-cols-1 gap-8">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="font-headline text-2xl flex items-center gap-2">
                <Clapperboard className="h-6 w-6 text-primary" />
                Scene Prompt
              </CardTitle>
              <div className="flex items-center gap-2">
                {isDirty && (
                  <Button variant="ghost" size="sm" onClick={() => form.reset()}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Clear
                  </Button>
                )}
                {showHistoryButton && (
                  <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <History className="mr-2 h-4 w-4" />
                        History
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Generation History</DialogTitle>
                        <DialogDescription>
                          Here are your recent generations. They are saved in your browser.
                        </DialogDescription>
                      </DialogHeader>
                      <ScrollArea className="h-[60vh] -mx-6 px-6">
                        <div className="space-y-4 pr-1">
                          {history.length > 0 ? (
                            history.map((entry) => (
                              <Card key={entry.generatedAt}>
                                <CardContent className="p-4 flex items-center justify-between">
                                  <div>
                                    <p className="font-semibold">{entry.title}</p>
                                    <p className="text-sm text-muted-foreground">{entry.scenes[0].cinematic_description.substring(0, 80)}...</p>
                                    <p className="text-xs text-muted-foreground mt-1">{new Date(entry.generatedAt).toLocaleString()}</p>
                                  </div>
                                  <Button size="sm" onClick={() => handleLoadFromHistory(entry)}>Load</Button>
                                </CardContent>
                              </Card>
                            ))
                          ) : (
                            <div className="text-center text-muted-foreground py-12">
                              <p>No history yet.</p>
                              <p className="text-sm">Generate a scene to get started!</p>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                      {history.length > 0 && (
                        <DialogFooter>
                          <Button variant="destructive" onClick={handleClearHistory}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Clear History
                          </Button>
                        </DialogFooter>
                      )}
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form action={formAction} className="space-y-6">
                
                <FormField
                  control={form.control}
                  name="numberOfScenes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Scenes</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="5"
                          {...field}
                          onChange={event => field.onChange(+event.target.value)}
                          className="w-24"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sceneDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Scene Description</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Textarea 
                              {...field}
                              placeholder=""
                              rows={4}
                              className={cn(
                                "text-transparent caret-foreground",
                                field.value && "text-foreground"
                              )}
                            />
                            <div className="absolute inset-0 top-2.5 left-3.5 right-3.5 text-base md:text-sm text-muted-foreground pointer-events-none z-[1] overflow-hidden whitespace-pre-wrap">
                                  {!field.value && (
                                    <p>
                                      <span ref={placeholderRef}></span>
                                      <span ref={cursorRef} style={{ display: 'none' }}>|</span>
                                    </p>
                                  )}
                            </div>
                          </div>
                        </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {mainOptions.map((key, index) => {
                  if (index % 2 === 0) {
                    return (
                      <div key={key} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {renderSelect(snakeToCamel(key) as keyof SceneFormData, key.charAt(0).toUpperCase() + key.slice(1), formItems[key] || [])}
                        {mainOptions[index+1] && renderSelect(snakeToCamel(mainOptions[index+1]) as keyof SceneFormData, mainOptions[index+1].charAt(0).toUpperCase() + mainOptions[index+1].slice(1), formItems[mainOptions[index+1]] || [])}
                      </div>
                    )
                  }
                  return null;
                })}

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="advanced">
                    <AccordionTrigger>
                        <div className='flex items-center gap-2 text-lg font-headline'>
                          <Settings2 className="h-5 w-5 text-primary" />
                            Advanced Creative Settings
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      {advancedOptions.map((key, index) => {
                        if (index % 2 === 0) {
                          return (
                            <div key={key} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {renderSelect(snakeToCamel(key) as keyof SceneFormData, key.charAt(0).toUpperCase() + key.slice(1), formItems[key.replace(/ /g, '_')] || [])}
                              {advancedOptions[index + 1] && renderSelect(snakeToCamel(advancedOptions[index + 1]) as keyof SceneFormData, advancedOptions[index + 1].charAt(0).toUpperCase() + advancedOptions[index + 1].slice(1), formItems[advancedOptions[index + 1].replace(/ /g, '_')] || [])}
                            </div>
                          )
                        }
                        return null;
                      })}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                
                {formItems.voice_language && renderSelect('voiceLanguage', 'Voice Language', formItems.voice_language)}
                
                <Button type="submit" disabled={isPending} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-lg py-6">
                  {isPending ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Generating Scene...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Generate Scene
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        <div className="space-y-8">
          {isPending && (
            <Card>
              <CardHeader><Skeleton className="h-8 w-48 bg-muted" /></CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full bg-muted" />
                <Skeleton className="h-4 w-full bg-muted" />
                <Skeleton className="h-4 w-[80%] bg-muted" />
              </CardContent>
            </Card>
          )}

          {generationResult && (
          <>
              <div className="text-center">
                  <h2 className="text-3xl md:text-4xl font-headline font-bold tracking-tighter">{generationResult.title}</h2>
              </div>
              <Card>
                  <CardHeader>
                      <CardTitle className="font-headline text-2xl flex items-center gap-2">
                          <Wand2 className="h-6 w-6 text-primary" />
                          AI-Enhanced Attributes
                      </CardTitle>
                      <CardDescription>
                          These are the core creative choices that guided the AI's generation process.
                      </CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
                      {Object.entries(generationResult.selected_attributes).map(([key, value]) => {
                          if (!value) return null;
                          const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                          return (
                              <div key={key} className="space-y-1">
                                  <p className="font-semibold text-muted-foreground">{label}</p>
                                  <p className="text-foreground capitalize">{value.split(' in ')[1] || value.split(' with ')[1] || value}</p>
                              </div>
                          )
                      })}
                  </CardContent>
              </Card>

              <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl flex items-center gap-2">
                        <BookCheck className="h-6 w-6 text-primary" />
                        Master Scene Template
                    </CardTitle>
                    <CardDescription>
                        This is the AI's rulebook for keeping every scene consistent.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                    {Object.entries(generationResult.master_scene_template).map(([key, value]) => {
                        if (!value) return null;
                        const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                        return (
                            <div key={key}>
                                <p className="font-semibold text-muted-foreground">{label}</p>
                                <p className="text-foreground whitespace-pre-wrap">{value}</p>
                            </div>
                        )
                    })}
                </CardContent>
              </Card>
              
              <div className="flex justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => handleExport('json')}>
                      <FileJson className="mr-2 h-4 w-4" />
                      Export as JSON
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleExport('txt')}>
                      <FileText className="mr-2 h-4 w-4" />
                      Export as TXT
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <Tabs defaultValue="english" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="english">English / Video Prompt</TabsTrigger>
                    <TabsTrigger value="originalLanguage" disabled={!generationResult.translated_scenes || generationResult.translated_scenes.length === 0}>
                        {generationResult.original_language || 'Original Language'}
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="english">
                      <div className="space-y-4">
                        {generationResult.scenes.map((scene) => (
                          <SceneCard
                            key={`${scene.scene_number}-${scene.cinematic_description.slice(0, 10)}`}
                            scene={scene}
                            isTranslated={false}
                            onCopy={() => handleCopyScene(scene)}
                            onDelete={() => handleDeleteScene(scene.scene_number)}
                            onRegenerate={() => setSceneToRegenerate(scene)}
                            onImageGenerated={handleImageGenerated}
                          />
                        ))}
                      </div>
                  </TabsContent>
                  <TabsContent value="originalLanguage">
                      <div className="space-y-4">
                        {generationResult.translated_scenes?.map((scene) => (
                          <SceneCard
                            key={`${scene.scene_number}-translated`}
                            scene={scene}
                            isTranslated={true}
                            onCopy={() => handleCopyScene(scene)}
                            onDelete={() => handleDeleteScene(scene.scene_number)}
                            onRegenerate={() => setSceneToRegenerate(scene)}
                            onImageGenerated={handleImageGenerated}
                          />
                        ))}
                      </div>
                  </TabsContent>
              </Tabs>
          </>
          )}
          
          {!isPending && !state.success && state.message && !state.message.includes("validation") && (
            <Card className="border-destructive/50 text-destructive">
              <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle /> Generation Error</CardTitle></CardHeader>
              <CardContent>
                <p>{state.message}</p>
                <p className="text-sm text-muted-foreground mt-2">Please try adjusting your prompt or try again later.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
