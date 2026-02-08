"use client";

import TiltedCard from './tilted-card';

interface ArticleCardProps {
    title: string;
    description: string;
    href: string;
    genre: string;
    date: string;
    image?: string;
}

export const ArticleCardReact = ({ title, description, href, genre, date, image }: ArticleCardProps) => {
    const genreColors: Record<string, string> = {
        tech: 'var(--color-tech)',
        lifestyle: 'var(--color-lifestyle)',
        review: 'var(--color-review)',
        news: 'var(--color-news)',
        economics: '#FFD700',
    };

    const isEnglish = href.startsWith('/en-us');
    const isHindi = href.startsWith('/hi-in');
    const readMoreText = isEnglish ? "Read More" : (isHindi ? "और पढ़ें" : "続きを読む");

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
            <TiltedCard
                imageSrc={image || '/placeholder-pattern.png'}
                altText={title}
                captionText={readMoreText}
                containerHeight="250px"
                containerWidth="100%"
                imageHeight="250px"
                imageWidth="100%"
                rotateAmplitude={12}
                scaleOnHover={1.05}
                showMobileWarning={false}
                showTooltip={true}
                displayOverlayContent={true}
                overlayContent={
                    <div style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        backdropFilter: 'blur(4px)',
                        borderRadius: '8px',
                        color: 'white',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        border: '1px solid rgba(255,255,255,0.2)'
                    }}>
                        {genre.toUpperCase()}
                    </div>
                }
            />

            <a href={href} style={{ textDecoration: 'none', color: 'inherit', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ marginBottom: '0.5rem' }}>
                    <span style={{
                        fontSize: '0.75rem',
                        color: 'var(--color-text-muted)',
                        display: 'block',
                        marginBottom: '0.25rem'
                    }}>
                        {date}
                    </span>
                    <h3 style={{
                        fontSize: '1.25rem',
                        fontWeight: 'bold',
                        margin: '0 0 0.5rem 0',
                        lineHeight: '1.2',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                    }}>
                        {title}
                    </h3>
                    <p style={{
                        fontSize: '0.875rem',
                        color: 'var(--color-text-secondary)',
                        margin: 0,
                        lineHeight: '1.5',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                    }}>
                        {description}
                    </p>
                </div>
            </a >
        </div >
    );
};
