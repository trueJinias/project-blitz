
import fs from 'fs';
import https from 'https';

// Video IDs
const videos = [
    { name: 'nova-shaver.jpg', id: 'PyyxOTi1MKc' }, // Nova Lint Remover
    { name: 'conair-shaver.jpg', id: 'W4L5Ty_DY4c' }, // Conair Fabric Shaver
    // Placeholders for Panasonic and Conair Steamer - will update after search results
    { name: 'panasonic-steamer.jpg', id: '' },
    { name: 'conair-steamer.jpg', id: '' }
];

// Helper to update ID based on search results
// (This script is a template, I will execute the final one with real IDs)
