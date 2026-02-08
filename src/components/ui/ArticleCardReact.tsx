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
        <a href={href} style={{ textDecoration: 'none', color: 'inherit', display: 'block', width: '100%' }}>
            <TiltedCard
                imageSrc={image || '/placeholder-pattern.png'}
                altText={title}
                captionText={readMoreText}
                containerHeight="320px" // Better height for grid
                containerWidth="100%"
                rotateAmplitude={12}
                scaleOnHover={1.05}
                showMobileWarning={false}
                showTooltip={true}
                displayOverlayContent={true}
                overlayContent={
                    <div style={{
                        position: 'absolute',
                        inset: '20px', // Use inset for guaranteed expansion
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end', // Align text to bottom
                        padding: '1.25rem',
                        background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)',
                        backdropFilter: 'blur(8px)',
                        borderRadius: '16px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        transform: 'translateZ(60px)',
                        boxShadow: '0 15px 35px rgba(0,0,0,0.5)',
                        pointerEvents: 'none' // Link is handled by parent <a>
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                            <span style={{
                                padding: '0.2rem 0.6rem',
                                backgroundColor: genreColors[genre] || 'var(--color-tech)',
                                color: 'black',
                                fontSize: '0.65rem',
                                fontWeight: '900',
                                borderRadius: '4px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>
                                {genre}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', fontWeight: '500' }}>{date}</span>
                        </div>

                        <h3 style={{
                            fontSize: '1.15rem',
                            fontWeight: '800',
                            margin: '0 0 0.5rem 0',
                            color: 'white',
                            lineHeight: '1.3',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            textAlign: 'left',
                            overflow: 'hidden',
                            textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                        }}>
                            {title}
                        </h3>

                        <p style={{
                            fontSize: '0.85rem',
                            color: 'rgba(255,255,255,0.8)',
                            margin: 0,
                            lineHeight: '1.4',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            textAlign: 'left',
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
