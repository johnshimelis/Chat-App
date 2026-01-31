
import { PrismaClient } from '@prisma/client'
import 'dotenv/config'

const prisma = new PrismaClient()

async function main() {
    try {
        console.log('Ensuring AI Assistant user exists...')
        const aiUser = await prisma.user.upsert({
            where: { id: 'ai-assistant' },
            update: {},
            create: {
                id: 'ai-assistant',
                name: 'AI Assistant',
                email: 'ai@bot',
                image: null,
            },
        })
        console.log('✅ AI Assistant user ensured:', aiUser.id)
    } catch (e) {
        console.error('❌ Failed to ensure AI Assistant user:', e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
