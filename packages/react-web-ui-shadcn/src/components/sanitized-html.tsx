/*
 * @Author: <Tin Tran> (tindl88@gmail.com)
 * @Created: 2025-02-11 15:22:10
 */

'use client';

import type { HTMLReactParserOptions } from 'html-react-parser';
import type { FC } from 'react';
import HtmlReactParser, { Element } from 'html-react-parser';

import type { MediaEmbedProps } from './shortcodes/media-embed';
import { cn } from '../lib/utils';
import MediaEmbed from './shortcodes/media-embed';

export const AUDIO_REGEX = /<figure class="media">\s*<oembed\s+url="([^"]+\.(mp3|ogg|wav))">\s*<\/oembed>\s*<\/figure>/g;
export const VIDEO_REGEX = /<figure class="media">\s*<oembed\s+url="([^"]+\.(mp4|avi))">\s*<\/oembed>\s*<\/figure>/g;

type SanitizedHTMLProps = {
  className?: string;
  html: string;
};

export const SanitizedHTML: FC<SanitizedHTMLProps> = ({ className, html }) => {
  const processHtml = (content: string) => {
    if (!content) return '';

    // Replace media embed patterns with component placeholders
    const replacedHtml = content
      .replaceAll(AUDIO_REGEX, '<MediaEmbed url="$1" type="audio"></MediaEmbed>')
      .replaceAll(VIDEO_REGEX, '<MediaEmbed url="$1" type="video"></MediaEmbed>');

    const options: HTMLReactParserOptions = {
      replace: node => {
        if (node instanceof Element && node.attribs) {
          if (node.name === 'mediaembed') {
            const attribs = node.attribs as MediaEmbedProps;

            return <MediaEmbed url={attribs.url} type={attribs.type} />;
          }
        }

        return undefined;
      },
    };

    return HtmlReactParser(replacedHtml, options);
  };

  return <div className={cn('wysiwyg prose', className)}>{processHtml(html)}</div>;
};
