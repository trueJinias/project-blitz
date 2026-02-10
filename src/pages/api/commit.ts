// API: GitHub APIでファイルをコミット
import type { APIRoute } from 'astro';

export const prerender = false;

interface FileEntry {
    path: string;
    content: string;
}

interface CommitResult {
    path: string;
    success: boolean;
    error?: string;
}

export const POST: APIRoute = async ({ request }) => {
    try {
        const { files, token, message } = await request.json();

        if (!files || !Array.isArray(files) || files.length === 0) {
            return new Response(JSON.stringify({ error: 'ファイルが必要です' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }
        if (!token) {
            return new Response(JSON.stringify({ error: 'GitHub Tokenが必要です' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        const OWNER = 'trueJinias';
        const REPO = 'project-blitz';
        const results: CommitResult[] = [];

        for (const file of files as FileEntry[]) {
            try {
                const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${file.path}`;

                // Check if file exists (get SHA)
                let sha: string | null = null;
                try {
                    const checkRes = await fetch(url, {
                        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/vnd.github.v3+json' }
                    });
                    if (checkRes.ok) {
                        const existing = await checkRes.json();
                        sha = existing.sha;
                    }
                } catch (_e) { /* file doesn't exist, that's fine */ }

                // Create/Update file
                const body: Record<string, string> = {
                    message: message || `Add article: ${file.path}`,
                    content: btoa(unescape(encodeURIComponent(file.content))),
                    branch: 'main'
                };
                if (sha) body.sha = sha;

                const res = await fetch(url, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(body)
                });

                if (!res.ok) {
                    const errData = await res.json();
                    results.push({ path: file.path, success: false, error: errData.message });
                } else {
                    results.push({ path: file.path, success: true });
                }
            } catch (e: unknown) {
                const msg = e instanceof Error ? e.message : 'Unknown error';
                results.push({ path: file.path, success: false, error: msg });
            }
        }

        const allSuccess = results.every(r => r.success);
        return new Response(JSON.stringify({ success: allSuccess, results }), {
            status: allSuccess ? 200 : 207,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Internal error';
        return new Response(JSON.stringify({ error: msg }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
