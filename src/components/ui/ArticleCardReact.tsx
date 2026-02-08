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
        <a href={href} style={{ textDecoration: 'none', color: 'inherit', display: 'block', width: '100%', boxSizing: 'border-box' }}>
            <TiltedCard
                imageSrc={image || '/placeholder-pattern.png'}
                altText={title}
                captionText={readMoreText}
                containerHeight="400px" // Restored height for better visibility
                containerWidth="100%"
                rotateAmplitude={12}
                scaleOnHover={1.05}
                showMobileWarning={false}
                showTooltip={true}
                displayOverlayContent={true}
                overlayContent={
                    <div style={{
                        position: 'absolute',
                        top: '20px',
                        left: '20px',
                        right: '20px',
                        bottom: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        padding: '1.5rem',
                        background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 60%, transparent 100%)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '20px',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        transform: 'translateZ(60px)',
                        boxShadow: '0 15px 45px rgba(0,0,0,0.6)',
                        pointerEvents: 'none',
                        boxSizing: 'border-box',
                        width: 'calc(100% - 40px)' // Force width expand
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                            <span style={{
                                padding: '0.25rem 0.75rem',
                                backgroundColor: genreColors[genre] || 'var(--color-tech)',
                                color: 'black',
                                fontSize: '0.7rem',
                                fontWeight: '900',
                                borderRadius: '6px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em'
                            }}>
                                {genre}
                            </span>
                            <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', fontWeight: '600' }}>{date}</span>
                        </div>

                        <h3 style={{
                            fontSize: '1.35rem',
                            fontWeight: '900',
                            margin: '0 0 0.75rem 0',
                            color: 'white',
                            lineHeight: '1.2',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            textAlign: 'left',
                            overflow: 'hidden',
                            textShadow: '0 3px 6px rgba(0,0,0,0.7)'
                        }}>
                            {title}
                        </h3>

                        <p style={{
                            fontSize: '0.9rem',
                            color: 'rgba(255,255,255,0.85)',
                            margin: 0,
                            lineHeight: '1.5',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            textAlign: 'left',
                            overflow: 'hidden',
                            textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                        }}>
                            {description}
                        </p>
                    </div>
                }
            />
        </a>
    );
};
