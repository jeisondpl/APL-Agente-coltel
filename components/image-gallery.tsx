'use client'

import { useState } from 'react'
import type { PictureContentBlock } from '@/lib/types'

interface ImageGalleryProps {
  images: PictureContentBlock[]
}

interface ImageItemProps {
  url: string
  index: number
  total: number
}

function ImageItem({ url, index, total }: ImageItemProps) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  if (error) {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-slate-400"
        style={{ minHeight: '140px' }}
        role="img"
        aria-label={`Imagen ${index + 1} no disponible`}
      >
        {/* Image icon */}
        <svg
          className="mb-2 size-8 opacity-40"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
          />
        </svg>
        <span className="text-xs">Imagen {index + 1} de {total} — no disponible</span>
      </div>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setLightboxOpen(true)}
        className="group relative block w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm transition-all duration-200 hover:border-indigo-200 hover:shadow-md focus-ring"
        aria-label={`Ver imagen ${index + 1} de ${total} en pantalla completa`}
        style={{ minHeight: loaded ? undefined : '140px' }}
      >
        {/* Loading skeleton */}
        {!loaded && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100" />
        )}

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={`Imagen de referencia ${index + 1} de ${total}`}
          className={[
            'w-full object-cover transition-all duration-300',
            'group-hover:scale-[1.02]',
            loaded ? 'opacity-100' : 'opacity-0',
          ].join(' ')}
          style={{ maxHeight: '320px' }}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
        />

        {/* Hover overlay */}
        {loaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-200 group-hover:bg-black/10">
            <div className="scale-75 rounded-full bg-white/90 p-2 opacity-0 shadow-lg transition-all duration-200 group-hover:scale-100 group-hover:opacity-100">
              <svg
                className="size-4 text-slate-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM10.5 7.5v6m3-3h-6"
                />
              </svg>
            </div>
          </div>
        )}

        {/* Image counter badge */}
        <div className="absolute bottom-2 right-2 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
          {index + 1} / {total}
        </div>
      </button>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={`Imagen ${index + 1} en pantalla completa`}
          onClick={() => setLightboxOpen(false)}
          onKeyDown={(e) => e.key === 'Escape' && setLightboxOpen(false)}
        >
          <button
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20 focus-ring"
            onClick={() => setLightboxOpen(false)}
            aria-label="Cerrar imagen"
          >
            <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={`Imagen de referencia ${index + 1}`}
            className="max-h-[90vh] max-w-full rounded-xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  if (images.length === 0) return null

  const isSingle = images.length === 1
  const isDouble = images.length === 2

  return (
    <div className="mt-4">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
        {images.length === 1 ? 'Imagen de referencia' : `${images.length} imágenes de referencia`}
      </p>
      <div
        className={[
          'grid gap-3',
          isSingle ? 'grid-cols-1' : isDouble ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3',
        ].join(' ')}
      >
        {images.map((img, i) => (
          <ImageItem
            key={`${img.url}-${i}`}
            url={img.url}
            index={i}
            total={images.length}
          />
        ))}
      </div>
    </div>
  )
}
