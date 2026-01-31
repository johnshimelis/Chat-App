
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
        const userCount = await prisma.user.count()
        console.log(`Current user count: ${userCount}`)

        try {
            const messageCount = await prisma.message.count()
            console.log(`Current message count: ${messageCount}`)
            // Attempt to fetch one message to see if 'type' is accessible
            const msg = await prisma.message.findFirst()
            console.log('Sample message:', msg)
        } catch (msgErr) {
            console.error('❌ Failed to access Message table:', msgErr)
        }
    } catch (e) {
        console.error('❌ Connection failed:', e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
