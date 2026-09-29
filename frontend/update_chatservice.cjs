const fs = require('fs');
let content = fs.readFileSync('src/services/chatService.ts', 'utf8');

content = content.replace(
    /throw new Error\('Gagal terhubung ke server\. Periksa koneksi internetmu\.'\);/g,
    "throw new Error(locale === 'id' ? 'Gagal terhubung ke server. Periksa koneksi internetmu.' : 'Failed to connect to the server. Check your internet connection.');"
);

content = content.replace(
    /throw new Error\('PAX sedang sibuk\. Coba lagi dalam beberapa menit ya 🙏'\);/g,
    "throw new Error(locale === 'id' ? 'PAX sedang sibuk. Coba lagi dalam beberapa menit ya 🙏' : 'PAX is currently busy. Please try again in a few minutes 🙏');"
);

content = content.replace(
    /lastError = new Error\(backendMsg \|\| 'Terjadi kesalahan\. Coba lagi nanti\.'\);/g,
    "lastError = new Error(backendMsg || (locale === 'id' ? 'Terjadi kesalahan. Coba lagi nanti.' : 'An error occurred. Please try again later.'));"
);

content = content.replace(
    /throw new Error\('Respons tidak valid dari PAX\.'\);/g,
    "throw new Error(locale === 'id' ? 'Respons tidak valid dari PAX.' : 'Invalid response from PAX.');"
);

content = content.replace(
    /throw lastError \?\? new Error\('Terjadi kesalahan\. Coba lagi nanti\.'\);/g,
    "throw lastError ?? new Error(locale === 'id' ? 'Terjadi kesalahan. Coba lagi nanti.' : 'An error occurred. Please try again later.');"
);

fs.writeFileSync('src/services/chatService.ts', content, 'utf8');
console.log('chatService Done');
