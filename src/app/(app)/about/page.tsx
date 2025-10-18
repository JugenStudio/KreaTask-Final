
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/providers/language-provider";
import { ArrowLeft, Info } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

interface InfoRowProps {
  label: string;
  value: string;
}

const InfoRow = ({ label, value }: InfoRowProps) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-1 md:gap-4 py-3 border-b border-border/50">
    <dt className="text-sm font-semibold text-muted-foreground">{label}</dt>
    <dd className="text-sm md:col-span-2 text-foreground">{value}</dd>
  </div>
);

export default function AboutPage() {
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
      <Button
        variant="outline"
        size="sm"
        asChild
        className="w-fit transition-all active:scale-95"
      >
        <Link href="/settings">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("about.back_button")}
        </Link>
      </Button>

      <div>
        <h1 className="text-2xl md:text-3xl font-bold font-headline flex items-center gap-3">
          <Info className="h-6 w-6 md:h-8 md:h-8" />
          {t("about.title")}
        </h1>
      </div>
      
      <Card>
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col items-center text-center mb-8">
            <Image
              src="/images/logo2.png"
              alt="KreaTask Logo"
              width={48}
              height={48}
            />
            <h2 className="text-3xl font-bold font-headline mt-2 text-foreground">
              KreaTask
            </h2>
          </div>

          <dl className="divide-y divide-border/50">
            <InfoRow label={t("about.version")} value="3.0.0" />
            <InfoRow label={t("about.developer")} value="Rahmadhan Naufal Athabarani" />
            <InfoRow label={t("about.nim")} value="521198" />
            <InfoRow
              label={t("about.thesis_title")}
              value={t('about.thesis_title_value')}
            />
            <InfoRow
              label={t("about.study_program")}
              value={t('about.study_program_value')}
            />
            <InfoRow label={t("about.year")} value="2025" />
          </dl>
          
          <Separator className="my-6" />

          <p className="text-center text-xs text-muted-foreground">
            {t("about.copyright")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
