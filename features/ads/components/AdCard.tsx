"use client";

import { useState, useEffect } from "react";
import { Card } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Calendar, ExternalLink, Play, Image as ImageIcon } from "lucide-react";
import type { Ad } from "@/features/ads/types";

interface AdCardProps {
  ad: Ad;
  recencyActiveDays?: number;
  onClick?: (ad: Ad) => void;
}

export function AdCard({ ad, recencyActiveDays = 2, onClick }: AdCardProps) {
  const [imageError, setImageError] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [imageAspectRatio, setImageAspectRatio] = useState<string>("9/16"); // Default aspect ratio

  // Função para detectar aspect ratio da imagem
  const detectImageAspectRatio = (imageUrl: string) => {
    const img = new Image();
    img.onload = () => {
      const ratio = img.width / img.height;
      
      // Definir aspect ratios baseados nas dimensões
      if (ratio >= 0.9 && ratio <= 1.1) {
        // Quadrado (1:1)
        setImageAspectRatio("1/1");
      } else if (ratio >= 1.7 && ratio <= 1.9) {
        // Landscape/horizontal (16:9)
        setImageAspectRatio("16/9");
      } else if (ratio >= 0.55 && ratio <= 0.65) {
        // Portrait/vertical (9:16)
        setImageAspectRatio("9/16");
      } else if (ratio >= 1.2 && ratio <= 1.4) {
        // Ligeiramente horizontal (4:3)
        setImageAspectRatio("4/3");
      } else if (ratio >= 0.7 && ratio <= 0.8) {
        // Ligeiramente vertical (3:4)
        setImageAspectRatio("3/4");
      } else {
        // Manter padrão para casos extremos
        setImageAspectRatio("9/16");
      }
    };
    img.onerror = () => {
      // Em caso de erro, manter o padrão
      setImageAspectRatio("9/16");
    };
    img.src = imageUrl;
  };

  // Detectar aspect ratio quando a mídia mudar
  useEffect(() => {
    if (ad.asset_type === "image" && ad.source && isDirectMedia(ad.source)) {
      detectImageAspectRatio(ad.source);
    } else if (ad.asset_type === "video" && ad.video_image_preview) {
      // Para vídeos, usar a imagem de preview para detectar o aspect ratio
      detectImageAspectRatio(ad.video_image_preview);
    }
  }, [ad.source, ad.asset_type, ad.video_image_preview]);

  // Calcular se o anúncio é recente/ativo
  const isRecent = ad.start_date
    ? new Date(ad.start_date) >=
      new Date(Date.now() - recencyActiveDays * 24 * 60 * 60 * 1000)
    : false;

  // Gerar slug do competidor para logo
  const competitorSlug = ad.competitor?.name
    ?.toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  // Processar tags
  const tags =
    ad.tags
      ?.split(/[,;]/)
      .map((tag: string) => tag.trim())
      .filter(Boolean)
      .slice(0, 3) || [];

  // Gerar título com fallbacks
  const getTitle = () => {
    if (ad.product) return ad.product;

    if (ad.transcription) {
      return ad.transcription.split(" ").slice(0, 10).join(" ") + "...";
    }

    if (ad.image_description) {
      return ad.image_description.split(" ").slice(0, 10).join(" ") + "...";
    }

    return "Anúncio sem título";
  };

  // Verificar se source é mídia direta
  const isDirectMedia = (url: string) => {
    return (
      url.includes(".mp4") ||
      url.includes(".mov") ||
      url.includes(".webm") ||
      url.includes(".jpg") ||
      url.includes(".jpeg") ||
      url.includes(".png") ||
      url.includes(".webp")
    );
  };

  // Verificar se é plataforma Meta
  const isMetaPlatform =
    ad.source?.includes("facebook") || ad.source?.includes("meta");

  // Formatar data
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "–";
    return new Date(dateString).toLocaleDateString("pt-BR", {
      timeZone: "America/Sao_Paulo",
    });
  };

  // URL para Meta Ads Library
  const metaAdsUrl = `https://www.facebook.com/ads/library/?id=${ad.ad_id}`;

  return (
    <Card
      className="overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer group"
      onClick={() => onClick?.(ad)}
    >
      {/* Header com Logo e Info */}
      <div className="p-4 border-b">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <img
              src={`/logos/competitors/${competitorSlug}.jpg`}
              alt={ad.competitor?.name || "Competidor"}
              className="w-8 h-8 rounded"
              onError={(e) => {
                e.currentTarget.src = "/placeholder-logo.svg";
              }}
            />
            <div>
              <h3 className="font-semibold text-sm">{ad.competitor?.name}</h3>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                {formatDate(ad.start_date)}
              </div>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-col gap-1">
            <Badge variant="outline" className="text-xs">
              {ad.asset_type === "video" ? (
                <>
                  <Play className="w-3 h-3 mr-1" /> 
                  {ad.video_image_preview ? "Vídeo (Preview)" : "Vídeo"}
                </>
              ) : (
                <>
                  <ImageIcon className="w-3 h-3 mr-1" /> Imagem
                </>
              )}
            </Badge>
            {isMetaPlatform && (
              <Badge variant="secondary" className="text-xs">
                Meta
              </Badge>
            )}
            {isRecent && (
              <Badge variant="default" className="text-xs bg-green-500">
                Ativo
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Mídia - Tamanho dinâmico baseado no aspect ratio */}
      <div 
        className="relative bg-gray-100"
        style={{ aspectRatio: imageAspectRatio }}
      >
        {/* Aspect ratio dinâmico baseado na detecção da imagem */}
        {ad.asset_type === "video" &&
        isRecent &&
        ad.source &&
        isDirectMedia(ad.source) &&
        !videoError ? (
          showVideo ? (
            <video
              controls
              autoPlay
              className="w-full h-full object-cover"
              onError={() => setVideoError(true)}
              poster="/placeholder.jpg"
            >
              <source src={ad.source} type="video/mp4" />
              Seu navegador não suporta vídeo.
            </video>
          ) : (
            <button
              type="button"
              className="relative w-full h-full group"
              onClick={(e) => {
                e.stopPropagation();
                setShowVideo(true);
              }}
              aria-label="Reproduzir vídeo"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ad.video_image_preview || "/placeholder.jpg"}
                alt="Prévia do vídeo"
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/placeholder.jpg";
                }}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="rounded-full bg-black/60 p-3 shadow-md group-hover:bg-black/70 transition-colors">
                  <Play className="w-7 h-7 text-white" />
                </div>
              </div>
            </button>
          )
        ) : ad.asset_type === "image" &&
          ad.source &&
          isDirectMedia(ad.source) &&
          !imageError ? (
          <img
            src={ad.source}
            alt={getTitle()}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <div className="text-center px-3">
              {ad.asset_type === "video" ? (
                <Play className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              ) : (
                <ImageIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              )}
              <p className="text-sm text-gray-600 font-medium">
                {ad.asset_type === "video" ? "Vídeo" : "Imagem"} não disponível
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Mídia indisponível na Meta Ads Library.
              </p>
              {(ad.transcription || ad.image_description) && (
                <p className="text-xs text-primary mt-2 underline-offset-2 group-hover:underline">
                  Clique no card para ver {ad.transcription && ad.asset_type === "video" ? "a transcrição" : ad.image_description && ad.asset_type === "image" ? "a descrição" : "os detalhes"}.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="p-4">
        {/* Título */}
        <h4 className="font-medium text-sm mb-2 line-clamp-2">{getTitle()}</h4>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {tags.map((tag: string, index: number) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {ad.tags && ad.tags.split(/[,;]/).length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{ad.tags.split(/[,;]/).length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Botão Meta Ads Library */}
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={(e) => {
            e.stopPropagation();
            window.open(metaAdsUrl, "_blank");
          }}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Ver na Meta Ads Library
        </Button>
      </div>
    </Card>
  );
}
