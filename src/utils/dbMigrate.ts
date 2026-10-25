// Tự migrate SQLite cache khi mở bằng bản app có schema khác (thêm/bớt cột, thêm bảng).
// schema.sql = `prisma migrate diff --from-empty` của schema hiện tại (sinh lúc `yarn generate`
// và lúc build). Bảng lệch cột → rebuild: đổi tên bảng cũ, tạo bảng mới theo schema.sql, chép
// các cột chung sang (cột mới nhận DEFAULT), xoá bảng cũ — tất cả trong 1 transaction.
// shortcut: chỉ so tên cột, không phát hiện đổi kiểu cột — khi cần đổi kiểu thì viết migrate riêng.
import fs from 'node:fs'

type Raw = {
    $queryRawUnsafe<T = unknown>(sql: string): Promise<T>
    $executeRawUnsafe(sql: string): Promise<number>
}
type Db = Raw & { $transaction<R>(fn: (tx: Raw) => Promise<R>): Promise<R> }

const q = (name: string) => `"${name.replace(/"/g, '""')}"`

/** Trả về danh sách bảng đã migrate (rỗng = schema đã khớp). Lỗi → throw, DB giữ nguyên. */
export async function migrateDb(db: Db, dbPath: string, schemaSql: string): Promise<string[]> {
    const statements = schemaSql
        .split(/;\s*(?:\n|$)/)
        .map((s) => s.replace(/^\s*--.*$/gm, '').trim())
        .filter(Boolean)
    const tables = new Map<string, { create: string; columns: string[]; extra: string[] }>()
    for (const s of statements) {
        const t = s.match(/^CREATE TABLE "([^"]+)"/)
        if (t) {
            const columns = [...s.matchAll(/^\s*"([^"]+)"/gm)].map((m) => m[1])
            tables.set(t[1], { create: s, columns, extra: [] })
            continue
        }
        const i = s.match(/^CREATE (?:UNIQUE )?INDEX .* ON "([^"]+)"/)
        if (i) tables.get(i[1])?.extra.push(s)
    }

    const pending: { name: string; existing: string[] }[] = []
    for (const [name, def] of tables) {
        const info = await db.$queryRawUnsafe<{ name: string }[]>(`PRAGMA table_info(${q(name)})`)
        const existing = info.map((c) => c.name)
        const same =
            existing.length === def.columns.length && def.columns.every((c) => existing.includes(c))
        if (!same) pending.push({ name, existing })
    }
    if (!pending.length) return []

    // Backup trước khi đụng vào — file nằm cạnh DB (prisma/*.sqlite* đã gitignore)
    if (fs.existsSync(dbPath) && fs.statSync(dbPath).size > 0) {
        fs.copyFileSync(dbPath, `${dbPath}.bak-migrate-${Date.now()}`)
    }

    await db.$transaction(async (tx) => {
        for (const { name, existing } of pending) {
            const def = tables.get(name)!
            const old = `_old_${name}`
            if (existing.length) {
                await tx.$executeRawUnsafe(`ALTER TABLE ${q(name)} RENAME TO ${q(old)}`)
                // index đi theo bảng khi đổi tên → xoá để tạo lại đúng tên ở bảng mới
                const idx = await tx.$queryRawUnsafe<{ name: string }[]>(
                    `SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='${old}' AND sql IS NOT NULL`
                )
                for (const { name: n } of idx) await tx.$executeRawUnsafe(`DROP INDEX ${q(n)}`)
            }
            await tx.$executeRawUnsafe(def.create)
            for (const s of def.extra) await tx.$executeRawUnsafe(s)
            if (existing.length) {
                const common = def.columns.filter((c) => existing.includes(c)).map(q).join(', ')
                if (common) {
                    await tx.$executeRawUnsafe(
                        `INSERT INTO ${q(name)} (${common}) SELECT ${common} FROM ${q(old)}`
                    )
                }
                await tx.$executeRawUnsafe(`DROP TABLE ${q(old)}`)
            }
        }
    })
    return pending.map((p) => p.name)
}
