/**
 * GitHub API - 記事ファイルをリポジトリにコミットする
 */

const REPO_OWNER = 'trueJinias';
const REPO_NAME = 'project-blitz';
const API_BASE = 'https://api.github.com';

/**
 * GitHub APIでファイルを作成または更新する
 * @param {string} path - リポジトリ内のファイルパス
 * @param {string} content - ファイル内容（プレーンテキスト）
 * @param {string} message - コミットメッセージ
 * @param {string} token - GitHub Personal Access Token
 * @returns {Promise<object>} APIレスポンス
 */
export async function createOrUpdateFile(path, content, message, token) {
    const url = `${API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`;

    // 既存ファイルのSHAを取得（更新の場合に必要）
    let sha = null;
    try {
        const existing = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json',
            },
        });
        if (existing.ok) {
            const data = await existing.json();
            sha = data.sha;
        }
    } catch (e) {
        // ファイルが存在しない場合は新規作成
    }

    const body = {
        message,
        content: btoa(unescape(encodeURIComponent(content))),
        branch: 'main',
    };
    if (sha) body.sha = sha;

    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(`GitHub API Error: ${err.message || response.statusText}`);
    }

    return await response.json();
}

/**
 * 複数ファイルを一括でコミットする
 * @param {Array<{path: string, content: string}>} files - ファイル配列
 * @param {string} message - コミットメッセージ
 * @param {string} token - GitHub PAT
 * @returns {Promise<Array>} 各ファイルの結果
 */
export async function commitMultipleFiles(files, message, token) {
    const results = [];
    for (const file of files) {
        try {
            const result = await createOrUpdateFile(file.path, file.content, message, token);
            results.push({ path: file.path, success: true, result });
        } catch (error) {
            results.push({ path: file.path, success: false, error: error.message });
        }
    }
    return results;
}
