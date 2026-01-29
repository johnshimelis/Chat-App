
import { PrismaClient } from '@prisma/client'
import 'dotenv/config'

const prisma = new PrismaClient({
    log: ['info']
})

async function main() {
    try {
        console.log('Testing connection to:', process.env.DATABASE_URL?.split('@')[1]) // Log only the host part for security
        await prisma.$connect()
        console.log('✅ Successfully connected to the database!')
        const count = await prisma.user.count()
        console.log(`Current user count: ${count}`)
    } catch (e) {
        console.error('❌ Connection failed:', e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
