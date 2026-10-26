// Lọc private key khỏi mọi thứ gửi lên Sentry. Key ví (main/swap/mint) lấy từ DB; ngoài ra mọi
// chuỗi 64 hex KHÔNG có tiền tố 0x cũng bị xoá (tx hash luôn có 0x nên vẫn giữ được để tra).
export function makeScrubber(getSecrets: () => string[]) {
    return <T>(data: T): T => {
        let text = JSON.stringify(data)
        if (text === undefined) return data
        for (const s of getSecrets()) {
            const hex = s.trim().replace(/^0x/i, '')
            if (/^[0-9a-fA-F]{64}$/.test(hex)) text = text.replace(new RegExp(`(0x)?${hex}`, 'gi'), '[key]')
        }
        text = text.replace(/(?<![0-9a-fA-Fx])[0-9a-fA-F]{64}(?![0-9a-fA-F])/g, '[hex64]')
        return JSON.parse(text)
    }
}
