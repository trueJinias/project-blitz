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
        <a href={href} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
            <TiltedCard
                imageSrc={image || '/placeholder-pattern.png'}
                altText={title}
                captionText={readMoreText}
                containerHeight="400px"
                containerWidth="100%"
                imageHeight="400px"
                imageWidth="100%"
                rotateAmplitude={12}
                scaleOnHover={1.05}
                showMobileWarning={false}
                showTooltip={true}
                displayOverlayContent={true}
                overlayContent={
                    <div style={{
                        position: 'absolute',
                        bottom: '20px',
                        left: '20px',
                        right: '20px',
                        padding: '1.5rem',
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        backdropFilter: 'blur(12px)',
                        borderRadius: '16px',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
                        transform: 'translateZ(50px)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                            <span style={{
                                padding: '0.25rem 0.75rem',
                                backgroundColor: genreColors[genre] || 'var(--color-tech)',
                                color: 'black',
                                fontSize: '0.65rem',
                                fontWeight: '800',
                                borderRadius: '4px',
                                textTransform: 'uppercase'
                            }}>
                                {genre}
                            </span>
                            <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)' }}>{date}</span>
                        </div>

                        <h3 style={{
                            fontSize: '1.25rem',
                            fontWeight: '800',
                            margin: 0,
                            color: 'white',
                            lineHeight: '1.3',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                        }}>
                            {title}
                        </h3>

                        <p style={{
                            fontSize: '0.85rem',
                            color: 'rgba(255,255,255,0.7)',
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
                }
            />
        </a>
    );
};
