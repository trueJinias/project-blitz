"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

export const BackgroundBeams = ({ className }: { className?: string }) => {
    return (
        <div
            className={cn(
                "absolute h-full w-full inset-0 bg-neutral-950 overflow-hidden",
                className
            )}
        >
            <div className="absolute h-full w-full inset-0 pointer-events-none">
                <BackgroundBeamsHandler />
            </div>
        </div>
    );
};

const BackgroundBeamsHandler = () => {
    return (
        <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            width="100%"
            height="100%"
            viewBox="0 0 600 600"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
        >
            <motion.path
                d="M-100 0 L300 600"
                stroke="url(#paint0_linear)"
                strokeWidth="40"
                strokeOpacity="0.5"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{
                    duration: 2,
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatType: "reverse",
                }}
            />
            <motion.path
                d="M0 0 L400 600"
                stroke="url(#paint1_linear)"
                strokeWidth="40"
                strokeOpacity="0.5"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{
                    duration: 2.5,
                    delay: 0.5,
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatType: "reverse",
                }}
            />
            <motion.path
                d="M100 0 L500 600"
                stroke="url(#paint0_linear)"
                strokeWidth="40"
                strokeOpacity="0.5"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{
                    duration: 3,
                    delay: 1,
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatType: "reverse",
                }}
            />
            <motion.path
                d="M200 0 L600 600"
                stroke="url(#paint1_linear)"
                strokeWidth="40"
                strokeOpacity="0.5"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{
                    duration: 3.5,
                    delay: 1.5,
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatType: "reverse",
                }}
            />
            <motion.path
                d="M300 0 L700 600"
                stroke="url(#paint0_linear)"
                strokeWidth="40"
                strokeOpacity="0.5"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{
                    duration: 4,
                    delay: 0,
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatType: "reverse",
                }}
            />

            <defs>
                <linearGradient
                    id="paint0_linear"
                    x1="-100"
                    y1="0"
                    x2="300"
                    y2="600"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor="#18CCFC" />
                    <stop offset="1" stopColor="#6344F5" stopOpacity="0" />
                </linearGradient>
                <linearGradient
                    id="paint1_linear"
                    x1="0"
                    y1="0"
                    x2="400"
                    y2="600"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor="#AE48FF" />
                    <stop offset="1" stopColor="#6344F5" stopOpacity="0" />
                </linearGradient>
            </defs>
        </svg>
    );
};
