// Định dạng file .adp (auto-deploy project) — chỉ dùng ở main process.
// File = JSON envelope; payload (tabs + Config + ScanWallet) được gzip rồi mã hoá AES-256-GCM,
// key dẫn xuất từ mật khẩu bằng scrypt. Sai mật khẩu / file bị sửa → GCM auth fail.
import crypto from 'node:crypto'
import zlib from 'node:zlib'

export const PROJECT_EXT = 'adp'
const FORMAT = 'auto-deploy-project'
const SCRYPT = { N: 1 << 15, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }

export interface ProjectPayload {
    tabs?: unknown // chỉ có ở file .adp bản đầu — bản mới lưu tabs trong Config._global.tabsJson
    config: any[]
    scanWallet: any[]
}

const deriveKey = (password: string, salt: Buffer) => crypto.scryptSync(password, salt, 32, SCRYPT)

export function encodeProject(payload: ProjectPayload, password: string): Buffer {
    const salt = crypto.randomBytes(16)
    const iv = crypto.randomBytes(12)
    const cipher = crypto.createCipheriv('aes-256-gcm', deriveKey(password, salt), iv)
    const data = Buffer.concat([cipher.update(zlib.gzipSync(JSON.stringify(payload))), cipher.final()])
    const envelope = {
        format: FORMAT,
        version: 1,
        savedAt: new Date().toISOString(),
        kdf: { name: 'scrypt', salt: salt.toString('base64'), N: SCRYPT.N, r: SCRYPT.r, p: SCRYPT.p },
        cipher: { name: 'aes-256-gcm', iv: iv.toString('base64'), tag: cipher.getAuthTag().toString('base64') },
        data: data.toString('base64'),
    }
    return Buffer.from(JSON.stringify(envelope))
}

export function decodeProject(file: Buffer, password: string): ProjectPayload {
    let env: any
    try {
        env = JSON.parse(file.toString('utf8'))
    } catch {
        throw new Error('File không phải định dạng .adp')
    }
    if (env?.format !== FORMAT) throw new Error('File không phải định dạng .adp')
    if (env.version !== 1) throw new Error(`File .adp version ${env.version} — cần cập nhật app để mở`)
    const decipher = crypto.createDecipheriv(
        'aes-256-gcm',
        crypto.scryptSync(password, Buffer.from(env.kdf.salt, 'base64'), 32, {
            N: env.kdf.N, r: env.kdf.r, p: env.kdf.p, maxmem: SCRYPT.maxmem,
        }),
        Buffer.from(env.cipher.iv, 'base64')
    )
    decipher.setAuthTag(Buffer.from(env.cipher.tag, 'base64'))
    let plain: Buffer
    try {
        plain = Buffer.concat([decipher.update(Buffer.from(env.data, 'base64')), decipher.final()])
    } catch {
        throw new Error('Sai mật khẩu hoặc file đã bị hỏng')
    }
    const payload = JSON.parse(zlib.gunzipSync(plain).toString('utf8'))
    if (!Array.isArray(payload?.config) || !Array.isArray(payload?.scanWallet)) {
        throw new Error('File .adp thiếu dữ liệu')
    }
    return payload
}
